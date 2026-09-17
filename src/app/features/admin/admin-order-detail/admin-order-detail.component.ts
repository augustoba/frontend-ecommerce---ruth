import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { SettingsService } from '../../../core/services/settings.service';
import { WhatsappService } from '../../../core/services/whatsapp.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { Order, PAYMENT_LABELS } from '../../../core/models/order.model';
import { Product, ProductSize, stockForSize } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-order-detail',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './admin-order-detail.component.html',
  styleUrl: './admin-order-detail.component.css',
})
export class AdminOrderDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly settingsService = inject(SettingsService);
  readonly arcaAvailable = () => this.settingsService.settings().arcaAvailable;
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
    if (order) {
      const ids = [...new Set(order.lines.map((l) => l.productId))];
      for (const id of ids) {
        this.productService.fetchOne(id).subscribe({
          next: (p) => this.lineProducts.update((m) => ({ ...m, [id]: p })),
          error: () => {},
        });
      }
    }
  }

  readonly acceptedTotal = computed(() => {
    const order = this.order();
    if (!order) return 0;
    return order.lines
      .filter((l) => l.accepted)
      .reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  });

  readonly acceptedCount = computed(
    () => this.order()?.lines.filter((l) => l.accepted).length ?? 0
  );

  /**
   * Ítems aceptados cuyo stock actual no alcanza para lo pedido. Vacío mientras
   * los productos no terminaron de cargar (no bloquea de más).
   */
  readonly stockIssues = computed(() => {
    const order = this.order();
    if (!order || order.status !== 'PENDIENTE') return [];
    return order.lines
      .filter((l) => l.accepted)
      .map((l) => ({ line: l, available: this.currentStock(l.productId, l.size) }))
      .filter((x) => x.available !== null && x.available < x.line.quantity);
  });

  /** Stock actual disponible para el talle de esa línea; null si el producto no cargó todavía. */
  currentStock(productId: string, size: ProductSize): number | null {
    const product = this.lineProducts()[productId];
    if (!product) return null;
    return stockForSize(product, size);
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

  toggleLine(index: number): void {
    const order = this.order();
    if (!order || order.status !== 'PENDIENTE') return;
    const lines = order.lines.map((l, i) => ({
      lineId: l.id,
      accepted: i === index ? !l.accepted : l.accepted,
    }));
    this.run(this.orderService.setLines(this.orderId, lines));
  }

  acceptAll(): void {
    this.setAll(true);
  }

  rejectAll(): void {
    this.setAll(false);
  }

  private setAll(accepted: boolean): void {
    const order = this.order();
    if (!order || order.status !== 'PENDIENTE') return;
    const lines = order.lines.map((l) => ({ lineId: l.id, accepted }));
    this.run(this.orderService.setLines(this.orderId, lines));
  }

  async confirmOrder(): Promise<void> {
    const order = this.order();
    if (!order || this.stockIssues().length > 0) return;
    const ok = await this.confirm.confirm({
      title: `Confirmar pedido ${order.code}`,
      message: `Se va a descontar el stock de los ${this.acceptedCount()} ítems tildados.`,
      confirmLabel: 'Confirmar y descontar',
    });
    if (ok) this.run(this.orderService.confirm(this.orderId));
  }

  async cancelOrder(): Promise<void> {
    const order = this.order();
    if (!order) return;
    const ok = await this.confirm.confirm({
      title: `Cancelar pedido ${order.code}`,
      message: 'Se cancela el pedido completo. No se toca el stock.',
      confirmLabel: 'Cancelar pedido',
      danger: true,
    });
    if (ok) this.run(this.orderService.cancel(this.orderId), () => this.router.navigate(['/admin/pedidos']));
  }

  /** Reintenta emitir la Factura de ARCA de esta venta (quedó como ticket interno porque ARCA la rechazó o no estaba configurada). */
  retryInvoice(): void {
    this.run(this.orderService.retryInvoice(this.orderId));
  }

  private run(obs: Observable<Order>, onSuccess?: () => void): void {
    this.saving.set(true);
    this.confirmError.set(null);
    obs.subscribe({
      next: (updated) => {
        this.order.set(updated);
        // refrescar el stock de los productos del pedido
        for (const id of new Set(updated.lines.map((l) => l.productId))) {
          this.productService.fetchOne(id).subscribe({
            next: (p) => this.lineProducts.update((m) => ({ ...m, [id]: p })),
            error: () => {},
          });
        }
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
