import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { DiscountService } from '../../../core/services/discount.service';
import { CouponService } from '../../../core/services/coupon.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, stockForSize } from '../../../core/models/product.model';
import { PaymentMethod, PAYMENT_LABELS } from '../../../core/models/order.model';
import { CouponCheck } from '../../../core/models/coupon.model';

interface PosLine {
  product: Product;
  size: string;
  quantity: number;
}

/**
 * Punto de venta del panel: el admin/vendedor carga una venta hecha en el local.
 * Crea el pedido y lo confirma en el acto (descuenta stock, suma a métricas).
 */
@Component({
  selector: 'app-admin-pos',
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './admin-pos.component.html',
})
export class AdminPosComponent {
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly discountService = inject(DiscountService);
  private readonly couponService = inject(CouponService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly paymentLabels = PAYMENT_LABELS;
  readonly paymentMethods: PaymentMethod[] = ['CASH', 'TRANSFER', 'QR_TRANSFER', 'QR_CARD'];

  readonly catalogStatus = this.productService.catalogStatus;
  readonly reloadCatalog = () => this.productService.reloadCatalog();
  private readonly products = this.productService.availableProducts;

  readonly search = signal('');
  /** Productos que se muestran en la grilla, filtrados por el buscador. */
  readonly visibleProducts = computed(() => {
    const term = this.search().trim().toLowerCase();
    const list = term
      ? this.products().filter((p) => p.name.toLowerCase().includes(term))
      : this.products();
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly lines = signal<PosLine[]>([]);
  readonly customerName = signal('');
  readonly paymentMethod = signal<PaymentMethod | null>('CASH');
  readonly saving = signal(false);

  // cupón
  readonly couponInput = signal('');
  readonly coupon = signal<CouponCheck | null>(null);
  readonly couponError = signal<string | null>(null);

  readonly subtotal = computed(() =>
    this.lines().reduce((sum, l) => sum + l.product.price * l.quantity, 0)
  );

  readonly discount = computed(() =>
    this.discountService.computeCartDiscount(
      this.lines().map((l) => ({ product: l.product, quantity: l.quantity })),
      { paymentMethod: this.paymentMethod(), deliveryMethod: 'PICKUP' }
    )
  );
  readonly discountAmount = computed(() => this.discount().discountAmount);
  readonly couponAmount = computed(() => {
    const c = this.coupon();
    if (!c) return 0;
    const raw = c.kind === 'PERCENT' ? Math.round((this.subtotal() * c.value) / 100) : c.value;
    return Math.min(raw, this.subtotal());
  });
  readonly total = computed(() => this.subtotal() - this.discountAmount() - this.couponAmount());

  stockOf(product: Product, size: string): number {
    return stockForSize(product, size);
  }

  addProduct(product: Product, size: string): void {
    const stock = stockForSize(product, size);
    if (stock <= 0) return;
    this.lines.update((list) => {
      const existing = list.find((l) => l.product.id === product.id && l.size === size);
      if (existing) {
        return list.map((l) =>
          l === existing ? { ...l, quantity: Math.min(l.quantity + 1, stock) } : l
        );
      }
      return [...list, { product, size, quantity: 1 }];
    });
    this.search.set('');
  }

  setQuantity(index: number, quantity: number): void {
    this.lines.update((list) =>
      list
        .map((l, i) => {
          if (i !== index) return l;
          const max = stockForSize(l.product, l.size);
          return { ...l, quantity: Math.max(1, Math.min(quantity, max)) };
        })
        .filter((l) => l.quantity > 0)
    );
  }

  removeLine(index: number): void {
    this.lines.update((list) => list.filter((_, i) => i !== index));
  }

  applyCoupon(): void {
    const code = this.couponInput().trim();
    if (!code) return;
    this.couponError.set(null);
    this.couponService.check(code, this.subtotal()).subscribe({
      next: (res) => {
        this.coupon.set(res);
        this.couponInput.set('');
      },
      error: (err) =>
        this.couponError.set((err?.error as { message?: string })?.message ?? 'Cupón inválido.'),
    });
  }

  removeCoupon(): void {
    this.coupon.set(null);
    this.couponError.set(null);
  }

  get canSave(): boolean {
    return this.lines().length > 0 && !!this.paymentMethod() && !this.saving();
  }

  register(): void {
    if (!this.canSave) return;
    this.saving.set(true);
    this.orderService
      .createPos({
        customerName: this.customerName().trim() || 'Venta en el local',
        items: this.lines().map((l) => ({
          productId: l.product.id,
          size: l.size,
          quantity: l.quantity,
        })),
        paymentMethod: this.paymentMethod(),
        couponCode: this.coupon()?.code ?? null,
      })
      .subscribe({
        next: (order) => {
          this.saving.set(false);
          this.toast.success(`Venta registrada (${order.code}). Stock descontado.`);
          this.router.navigate(['/admin/recibo', order.id]);
        },
        error: () => this.saving.set(false),
      });
  }
}
