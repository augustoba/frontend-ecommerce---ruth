import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { WhatsappService } from '../../../core/services/whatsapp.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { Order, OrderLine, PAYMENT_LABELS } from '../../../core/models/order.model';
import { Product, ProductSize, stockForSize } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-order-detail',
  imports: [CurrencyPipe, DatePipe, RouterLink, FormsModule],
  templateUrl: './admin-order-detail.component.html',
  styleUrl: './admin-order-detail.component.css',
})
export class AdminOrderDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly whatsapp = inject(WhatsappService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly confirm = inject(ConfirmService);

  /** true si el usuario puede confirmar / cancelar / editar líneas. */
  readonly canManage = () => this.auth.has('ORDERS_MANAGE');

  private readonly orderId = this.route.snapshot.paramMap.get('id') ?? '';

  /** El pedido lo trae el `orderResolver`; las mutaciones devuelven la versión nueva. */
  readonly order = signal<Order | null>(
    (this.route.snapshot.data['order'] as Order | null) ?? null
  );
  readonly notFound = !this.order();
  readonly saving = signal(false);
  readonly confirmError = signal<string | null>(null);
  readonly paymentLabels = PAYMENT_LABELS;

  mapsLink(order: Order): string | null {
    return order.shippingLat != null && order.shippingLng != null
      ? `https://www.google.com/maps?q=${order.shippingLat},${order.shippingLng}`
      : null;
  }

  /** Productos referenciados por las líneas del pedido (para el stock actual real). */
  private readonly lineProducts = signal<Record<string, Product>>({});

  constructor() {
    const order = this.order();
    if (order) this.refreshLineProducts(order);
  }

  private refreshLineProducts(order: Order): void {
    const ids = [...new Set(order.lines.map((l) => l.productId))];
    for (const id of ids) {
      this.productService.fetchOne(id).subscribe({
        next: (p) => this.lineProducts.update((m) => ({ ...m, [id]: p })),
        error: () => {},
      });
    }
  }

  /** Líneas que todavía no se resolvieron — las únicas que se pueden entregar/cancelar/editar. */
  readonly pendingLines = computed(
    () => this.order()?.lines.filter((l) => l.status === 'PENDIENTE') ?? []
  );

  /** IDs de líneas pendientes tildadas para una acción en lote (entregar/cancelar). */
  readonly selected = signal<Set<string>>(new Set());

  readonly selectedLines = computed(() =>
    this.pendingLines().filter((l) => this.selected().has(l.id))
  );
  readonly selectedTotal = computed(() =>
    this.selectedLines().reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
  );
  readonly pendingTotal = computed(() =>
    this.pendingLines().reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
  );

  /**
   * Líneas pendientes cuyo stock actual no alcanza para lo pedido. Vacío
   * mientras los productos no terminaron de cargar (no bloquea de más).
   */
  readonly stockIssues = computed(() => {
    const order = this.order();
    if (!order || order.status !== 'PENDIENTE') return [];
    return this.pendingLines()
      .map((l) => ({ line: l, available: this.currentStock(l.productId, l.size) }))
      .filter((x) => x.available !== null && x.available < x.line.quantity);
  });

  readonly selectedStockIssues = computed(() =>
    this.stockIssues().filter((x) => this.selected().has(x.line.id))
  );

  /** Stock actual disponible para el talle de esa línea; null si el producto no cargó todavía. */
  currentStock(productId: string, size: ProductSize): number | null {
    const product = this.lineProducts()[productId];
    if (!product) return null;
    return stockForSize(product, size);
  }

  lineStatusLabel(status: OrderLine['status']): string {
    switch (status) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'ENTREGADA':
        return 'Entregada';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return status;
    }
  }

  toggleSelect(lineId: string): void {
    this.selected.update((set) => {
      const next = new Set(set);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  }

  selectAllPending(): void {
    this.selected.set(new Set(this.pendingLines().map((l) => l.id)));
  }

  deselectAll(): void {
    this.selected.set(new Set());
  }

  /** Abre WhatsApp con el resumen del pedido ya redactado (para reenviarlo al cliente). */
  openWhatsapp(): void {
    const order = this.order();
    if (order) this.whatsapp.openOrderChat(order);
  }

  /** Copia el texto del resumen del pedido al portapapeles. */
  async copySummary(): Promise<void> {
    const order = this.order();
    if (!order) return;
    const text = this.whatsapp.buildOrderMessage(order);
    try {
      await navigator.clipboard.writeText(text);
      this.toast.success('Resumen del pedido copiado.');
    } catch {
      this.toast.error('No se pudo copiar. Copialo a mano desde el mensaje de WhatsApp.');
    }
  }

  /** Entrega sólo las líneas tildadas (descuenta su stock), deja el resto pendiente. */
  async confirmSelected(): Promise<void> {
    const order = this.order();
    const ids = [...this.selected()];
    if (!order || ids.length === 0 || this.selectedStockIssues().length > 0) return;
    const ok = await this.confirm.confirm({
      title: `Entregar ${ids.length} ítem(s)`,
      message: `Se va a descontar el stock de ${ids.length} ítem(s) seleccionados.`,
      confirmLabel: 'Entregar y descontar',
    });
    if (ok) {
      this.run(this.orderService.confirmLines(this.orderId, ids), () => this.selected.set(new Set()));
    }
  }

  /** Cancela sólo las líneas tildadas (no tocan stock), deja el resto pendiente. */
  async cancelSelected(): Promise<void> {
    const order = this.order();
    const ids = [...this.selected()];
    if (!order || ids.length === 0) return;
    const ok = await this.confirm.confirm({
      title: `Cancelar ${ids.length} ítem(s)`,
      message: 'No se toca el stock de estos ítems.',
      confirmLabel: 'Cancelar seleccionados',
      danger: true,
    });
    if (ok) {
      this.run(this.orderService.cancelLines(this.orderId, ids), () => this.selected.set(new Set()));
    }
  }

  async confirmOrder(): Promise<void> {
    const order = this.order();
    if (!order || this.stockIssues().length > 0) return;
    const ok = await this.confirm.confirm({
      title: `Confirmar pedido ${order.code}`,
      message: `Se va a descontar el stock de los ${this.pendingLines().length} ítem(s) pendientes.`,
      confirmLabel: 'Confirmar y descontar',
    });
    if (ok) this.run(this.orderService.confirm(this.orderId));
  }

  async cancelOrder(): Promise<void> {
    const order = this.order();
    if (!order) return;
    const ok = await this.confirm.confirm({
      title: `Cancelar pedido ${order.code}`,
      message: 'Se cancela todo lo que sigue pendiente. No se toca el stock.',
      confirmLabel: 'Cancelar pedido',
      danger: true,
    });
    if (ok) this.run(this.orderService.cancel(this.orderId), () => this.router.navigate(['/admin/pedidos']));
  }

  // --- Editar líneas pendientes (agregar / cambiar cantidad / sacar) ---

  readonly addSearch = signal('');
  readonly addProduct = signal<Product | null>(null);
  readonly addSize = signal<string | null>(null);
  readonly addQuantity = signal(1);

  readonly addMatches = computed(() => {
    const term = this.addSearch().trim().toLowerCase();
    if (!term || this.addProduct()) return [];
    return this.productService
      .availableProducts()
      .filter((p) => p.name.toLowerCase().includes(term))
      .slice(0, 6);
  });

  pickAddProduct(p: Product): void {
    this.addProduct.set(p);
    this.addSize.set(null);
    this.addSearch.set(p.name);
  }

  cancelAddLine(): void {
    this.addProduct.set(null);
    this.addSize.set(null);
    this.addSearch.set('');
    this.addQuantity.set(1);
  }

  confirmAddLine(): void {
    const product = this.addProduct();
    const size = this.addSize();
    if (!product || !size || this.addQuantity() <= 0) return;
    this.run(
      this.orderService.addLine(this.orderId, { productId: product.id, size, quantity: this.addQuantity() }),
      () => this.cancelAddLine()
    );
  }

  updateQuantity(line: OrderLine, quantity: number): void {
    if (quantity <= 0) return;
    this.run(this.orderService.updateLineQuantity(this.orderId, line.id, quantity));
  }

  async removeLine(line: OrderLine): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Sacar ítem del pedido',
      message: `Se saca "${line.productName}" (talle ${line.size}) del pedido.`,
      confirmLabel: 'Sacar',
      danger: true,
    });
    if (ok) this.run(this.orderService.removeLine(this.orderId, line.id));
  }

  private run(obs: Observable<Order>, onSuccess?: () => void): void {
    this.saving.set(true);
    this.confirmError.set(null);
    obs.subscribe({
      next: (updated) => {
        this.order.set(updated);
        // refrescar el stock de los productos del pedido
        this.refreshLineProducts(updated);
        this.saving.set(false);
        onSuccess?.();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        const msg = (err?.error as { message?: string })?.message;
        if (msg) this.confirmError.set(msg);
      },
    });
  }
}
