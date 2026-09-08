import { Injectable, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Order } from '../models/order.model';
import { CollectionStore } from '../state/collection-store';
import { apiUrl } from '../config/site-config';

/**
 * Pedidos. El listado del panel viene de `/api/admin/orders`. La creación
 * (`POST /api/orders`) es pública (checkout) y el backend calcula código,
 * descuentos y totales. Confirmar descuenta stock en el backend.
 */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly store = new CollectionStore<Order>(this.http, '/admin/orders');

  readonly orders = this.store.items;
  readonly status = this.store.status;
  readonly loading = this.store.loading;
  readonly errored = this.store.errored;
  readonly saving = this.store.saving;
  readonly reload = this.store.reload;

  readonly pendingCount = computed(
    () => this.store.items().filter((o) => o.status === 'PENDIENTE').length
  );

  ensureLoaded(): void {
    this.store.ensureLoaded();
  }

  getById(id: string): Order | undefined {
    return this.store.items().find((o) => o.id === id);
  }

  /** Crea el pedido desde el carrito (público). Devuelve el pedido con totales. */
  create(customerName: string, items: CartItem[]): Observable<Order> {
    return this.http.post<Order>(apiUrl('/orders'), {
      customerName: customerName.trim(),
      items: items.map((i) => ({
        productId: i.product.id,
        size: i.size,
        quantity: i.quantity,
      })),
    });
  }

  /** Tilda/destilda un ítem puntual (por índice, para no cambiar la plantilla). */
  toggleLine(orderId: string, lineIndex: number): void {
    const order = this.getById(orderId);
    if (!order || order.status !== 'PENDIENTE') return;
    const lines = order.lines.map((l, i) => ({
      lineId: l.id,
      accepted: i === lineIndex ? !l.accepted : l.accepted,
    }));
    this.store.mutate(this.http.put(apiUrl(`/admin/orders/${orderId}/lines`), { lines }));
  }

  setAllLines(orderId: string, accepted: boolean): void {
    const order = this.getById(orderId);
    if (!order || order.status !== 'PENDIENTE') return;
    const lines = order.lines.map((l) => ({ lineId: l.id, accepted }));
    this.store.mutate(this.http.put(apiUrl(`/admin/orders/${orderId}/lines`), { lines }));
  }

  confirm(orderId: string): void {
    this.store.mutate(this.http.post(apiUrl(`/admin/orders/${orderId}/confirm`), {}));
  }

  cancel(orderId: string): void {
    this.store.mutate(this.http.post(apiUrl(`/admin/orders/${orderId}/cancel`), {}));
  }
}
