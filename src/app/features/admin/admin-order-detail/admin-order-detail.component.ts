import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { Order } from '../../../core/models/order.model';
import { ProductSize, stockForSize } from '../../../core/models/product.model';

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

  private readonly orderId = this.route.snapshot.paramMap.get('id') ?? '';

  /** El pedido lo trae el `orderResolver`; las mutaciones devuelven la versión nueva. */
  readonly order = signal<Order | null>(
    (this.route.snapshot.data['order'] as Order | null) ?? null
  );
  readonly notFound = !this.order();
  readonly saving = signal(false);

  constructor() {
    this.productService.ensureAdminLoaded();
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

  /** Stock actual disponible para el talle de esa línea (para avisar si ya no alcanza) */
  currentStock(productId: string, size: ProductSize): number | null {
    const product = this.productService.getById(productId);
    if (!product) return null;
    return stockForSize(product, size);
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

  confirmOrder(): void {
    const order = this.order();
    if (!order) return;
    const confirmed = window.confirm(
      `¿Confirmar el pedido ${order.code}? Se va a descontar el stock de los ${this.acceptedCount()} ítems tildados.`
    );
    if (confirmed) this.run(this.orderService.confirm(this.orderId));
  }

  cancelOrder(): void {
    const order = this.order();
    if (!order) return;
    const confirmed = window.confirm(`¿Cancelar el pedido ${order.code} completo? No se va a tocar el stock.`);
    if (confirmed) {
      this.run(this.orderService.cancel(this.orderId), () => this.router.navigate(['/admin/pedidos']));
    }
  }

  private run(obs: import('rxjs').Observable<Order>, onSuccess?: () => void): void {
    this.saving.set(true);
    obs.subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.saving.set(false);
        onSuccess?.();
      },
      error: () => this.saving.set(false),
    });
  }
}
