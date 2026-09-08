import { Injectable, computed, inject, signal } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import { Order, OrderLine } from '../models/order.model';
import { ProductService } from './product.service';
import { DiscountService } from './discount.service';

const STORAGE_KEY = 'pp_orders';
const SEQ_KEY = 'pp_order_seq';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly productService = inject(ProductService);
  private readonly discountService = inject(DiscountService);

  private readonly ordersSignal = signal<Order[]>(this.loadInitial());

  /** Pedidos, más nuevos primero */
  readonly orders = this.ordersSignal.asReadonly();

  readonly pendingCount = computed(
    () => this.ordersSignal().filter((o) => o.status === 'pendiente').length
  );

  getById(id: string): Order | undefined {
    return this.ordersSignal().find((o) => o.id === id);
  }

  /** Crea el pedido a partir del carrito y le asigna un código correlativo */
  create(customerName: string, items: CartItem[]): Order {
    const lines: OrderLine[] = items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.product.price,
      accepted: true,
    }));

    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const discount = this.discountService.computeCartDiscount(
      items.map((it) => ({ product: it.product, quantity: it.quantity }))
    );
    const discountPercent = discount.discountPercent;
    const discountAmount = discount.discountAmount;

    const order: Order = {
      id: crypto.randomUUID(),
      code: this.nextCode(),
      customerName: customerName.trim() || 'Sin nombre',
      lines,
      subtotal,
      discountPercent,
      discountAmount,
      total: subtotal - discountAmount,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    };

    this.ordersSignal.update((list) => [order, ...list]);
    this.persist();
    return order;
  }

  /** Tilda/destilda un ítem puntual del pedido (solo mientras está pendiente) */
  toggleLine(orderId: string, lineIndex: number): void {
    this.ordersSignal.update((list) =>
      list.map((o) => {
        if (o.id !== orderId || o.status !== 'pendiente') return o;
        const lines = o.lines.map((l, i) => (i === lineIndex ? { ...l, accepted: !l.accepted } : l));
        return { ...o, lines };
      })
    );
    this.persist();
  }

  /** Tilda o destilda todos los ítems de una (aceptar todo / cancelar todo) */
  setAllLines(orderId: string, accepted: boolean): void {
    this.ordersSignal.update((list) =>
      list.map((o) => {
        if (o.id !== orderId || o.status !== 'pendiente') return o;
        return { ...o, lines: o.lines.map((l) => ({ ...l, accepted })) };
      })
    );
    this.persist();
  }

  /**
   * Confirma el pedido: descuenta del stock los ítems tildados (por ese
   * talle puntual) y marca el pedido como procesado. Los ítems destildados
   * se consideran cancelados y no tocan el stock.
   */
  confirm(orderId: string): void {
    const order = this.getById(orderId);
    if (!order || order.status !== 'pendiente') return;

    for (const line of order.lines) {
      if (line.accepted) {
        this.productService.decrementStock(line.productId, line.size, line.quantity);
      }
    }

    this.ordersSignal.update((list) =>
      list.map((o) =>
        o.id === orderId ? { ...o, status: 'procesado' as const, processedAt: new Date().toISOString() } : o
      )
    );
    this.persist();
  }

  /** Cancela el pedido completo sin tocar stock */
  cancel(orderId: string): void {
    this.ordersSignal.update((list) =>
      list.map((o) =>
        o.id === orderId && o.status === 'pendiente'
          ? { ...o, status: 'cancelado' as const, processedAt: new Date().toISOString() }
          : o
      )
    );
    this.persist();
  }

  private nextCode(): string {
    const seq = this.loadSeq() + 1;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SEQ_KEY, String(seq));
    }
    return `PED-${String(seq).padStart(4, '0')}`;
  }

  private loadSeq(): number {
    if (typeof localStorage === 'undefined') return 0;
    return Number(localStorage.getItem(SEQ_KEY) ?? '0') || 0;
  }

  private loadInitial(): Order[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Order[]) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ordersSignal()));
  }
}
