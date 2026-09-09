import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { DeliveryMethod, Order, OrderStatus, PaymentMethod, PublicOrder } from '../models/order.model';
import { HttpParams } from '@angular/common/http';

/** Datos de entrega + pago que se cargan en el carrito antes de comprar. */
export interface CheckoutDetails {
  deliveryMethod: DeliveryMethod;
  shippingAddress?: string | null;
  shippingReference?: string | null;
  shippingLat?: number | null;
  shippingLng?: number | null;
  paymentMethod: PaymentMethod;
  /** Código de cupón escrito en el carrito (opcional). */
  couponCode?: string | null;
}
import { CollectionStore } from '../state/collection-store';
import { apiUrl } from '../config/site-config';

/**
 * Pedidos. El listado del panel viene de `/api/admin/orders` **paginado**
 * (20 por página). La creación (`POST /api/orders`) es pública (checkout) y el
 * backend calcula código, descuentos y totales. Confirmar descuenta stock.
 *
 * El detalle de un pedido se trae puntual (`fetchOne`, vía resolver) para no
 * depender de que esté en la página cargada; las mutaciones devuelven el pedido
 * actualizado.
 */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly store = new CollectionStore<Order>(
    this.http,
    '/admin/orders',
    (raw) => raw as Order[],
    20
  );

  readonly orders = this.store.items;
  readonly status = this.store.status;
  readonly loading = this.store.loading;
  readonly errored = this.store.errored;
  readonly saving = this.store.saving;
  readonly reload = this.store.reload;
  readonly page = this.store.page;
  readonly totalPages = this.store.totalPages;
  readonly totalElements = this.store.totalElements;

  private readonly pendingCountSignal = signal(0);
  readonly pendingCount = this.pendingCountSignal.asReadonly();

  ensureLoaded(): void {
    this.store.ensureLoaded();
    this.loadPendingCount();
  }

  loadPage(n: number): void {
    this.store.loadPage(n);
  }

  /** Filtros del listado del panel. Recarga desde la página 0. */
  setFilters(f: {
    search?: string;
    status?: OrderStatus | '';
    from?: string;
    to?: string;
  }): void {
    this.store.setQuery({
      search: f.search?.trim() || undefined,
      status: f.status || undefined,
      from: f.from || undefined,
      to: f.to || undefined,
    });
    this.loadPendingCount();
  }

  loadPendingCount(): void {
    this.http
      .get<{ pending: number }>(apiUrl('/admin/orders/pending-count'))
      .subscribe({ next: (r) => this.pendingCountSignal.set(r.pending ?? 0), error: () => {} });
  }

  /** Trae un pedido puntual del backend (para el resolver del detalle). */
  fetchOne(id: string): Observable<Order> {
    return this.http.get<Order>(apiUrl(`/admin/orders/${id}`));
  }

  /** Crea el pedido desde el carrito (público). Devuelve el pedido con totales. */
  create(customerName: string, items: CartItem[], details: CheckoutDetails): Observable<Order> {
    return this.http.post<Order>(apiUrl('/orders'), {
      customerName: customerName.trim(),
      items: items.map((i) => ({
        productId: i.product.id,
        size: i.size,
        quantity: i.quantity,
      })),
      deliveryMethod: details.deliveryMethod,
      shippingAddress: details.shippingAddress ?? null,
      shippingReference: details.shippingReference ?? null,
      shippingLat: details.shippingLat ?? null,
      shippingLng: details.shippingLng ?? null,
      paymentMethod: details.paymentMethod,
      couponCode: details.couponCode ?? null,
    });
  }

  /**
   * Venta en el local (POS): crea y confirma el pedido en el acto (descuenta
   * stock). `items` son entradas simples {productId, size, quantity}.
   */
  createPos(body: {
    customerName: string;
    items: { productId: string; size: string; quantity: number }[];
    paymentMethod: PaymentMethod | null;
    couponCode?: string | null;
  }): Observable<Order> {
    return this.http
      .post<Order>(apiUrl('/admin/orders/pos'), {
        customerName: body.customerName.trim(),
        items: body.items,
        deliveryMethod: 'PICKUP',
        paymentMethod: body.paymentMethod,
        couponCode: body.couponCode ?? null,
      })
      .pipe(tap(() => this.afterMutation()));
  }

  /** Consulta pública del estado de un pedido con el código + el nombre del cliente. */
  lookup(code: string, name: string): Observable<PublicOrder> {
    return this.http.get<PublicOrder>(apiUrl('/orders/lookup'), {
      params: new HttpParams().set('code', code.trim()).set('name', name.trim()),
    });
  }

  /** Manda el array completo de aceptaciones y devuelve el pedido actualizado. */
  setLines(orderId: string, lines: { lineId: string; accepted: boolean }[]): Observable<Order> {
    return this.http
      .put<Order>(apiUrl(`/admin/orders/${orderId}/lines`), { lines })
      .pipe(tap(() => this.afterMutation()));
  }

  confirm(orderId: string): Observable<Order> {
    return this.http
      .post<Order>(apiUrl(`/admin/orders/${orderId}/confirm`), {})
      .pipe(tap(() => this.afterMutation()));
  }

  cancel(orderId: string): Observable<Order> {
    return this.http
      .post<Order>(apiUrl(`/admin/orders/${orderId}/cancel`), {})
      .pipe(tap(() => this.afterMutation()));
  }

  private afterMutation(): void {
    this.store.reload();
    this.loadPendingCount();
  }
}
