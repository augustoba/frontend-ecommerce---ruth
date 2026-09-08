import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
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

  // Se lee del signal de la lista completa (no getById) para que la vista
  // se actualice sola al tildar/destildar o confirmar, sin recargar.
  readonly order = computed(() => this.orderService.orders().find((o) => o.id === this.orderId));

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
    this.orderService.toggleLine(this.orderId, index);
  }

  acceptAll(): void {
    this.orderService.setAllLines(this.orderId, true);
  }

  rejectAll(): void {
    this.orderService.setAllLines(this.orderId, false);
  }

  confirmOrder(): void {
    const order = this.order();
    if (!order) return;
    const confirmed = window.confirm(
      `¿Confirmar el pedido ${order.code}? Se va a descontar el stock de los ${this.acceptedCount()} ítems tildados.`
    );
    if (confirmed) {
      this.orderService.confirm(this.orderId);
    }
  }

  cancelOrder(): void {
    const order = this.order();
    if (!order) return;
    const confirmed = window.confirm(`¿Cancelar el pedido ${order.code} completo? No se va a tocar el stock.`);
    if (confirmed) {
      this.orderService.cancel(this.orderId);
      this.router.navigate(['/admin/pedidos']);
    }
  }
}
