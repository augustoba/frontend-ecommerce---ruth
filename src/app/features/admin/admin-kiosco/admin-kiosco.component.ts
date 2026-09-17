import { Component, computed, effect, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { DiscountService } from '../../../core/services/discount.service';
import { ToastService } from '../../../core/services/toast.service';
import { SettingsService } from '../../../core/services/settings.service';
import { Product, stockForSize } from '../../../core/models/product.model';
import { PaymentMethod } from '../../../core/models/order.model';

interface KioscoLine {
  product: Product;
  size: string;
  quantity: number;
}

/**
 * Punto de venta de kiosco (Fase 14, ver PLAN_SAAS.md) — pantalla PROPIA
 * para negocios de venta puramente presencial, deliberadamente separada de
 * "Venta en el local" (`admin-pos`): esa sigue siendo la de una tienda con
 * ecommerce que también vende en persona (tiene cupón, email de marketing,
 * todos los medios de pago posibles). Acá no hay nada de eso — sólo
 * código de barras, carrito, y los 3 medios de pago que se cobran de
 * verdad parados en un mostrador: efectivo, transferencia, posnet.
 */
@Component({
  selector: 'app-admin-kiosco',
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './admin-kiosco.component.html',
})
export class AdminKioscoComponent {
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly discountService = inject(DiscountService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly settingsService = inject(SettingsService);

  /** Si el modo Factura ARCA está activo, qué tipo de comprobante corresponde según la condición IVA de la tienda. */
  private readonly facturaArcaActiva = computed(
    () => this.settingsService.settings().arcaAvailable && this.settingsService.settings().invoiceMode === 'FACTURA_ARCA'
  );
  /** Sólo un tenant Responsable Inscripto puede emitir Factura A (con CUIT) — a los demás siempre les sale Factura C. */
  readonly showBuyerCuitField = computed(
    () => this.facturaArcaActiva() && this.settingsService.settings().arcaCondicionIva === 'RESPONSABLE_INSCRIPTO'
  );
  readonly buyerCuit = signal('');

  /** Lo que va a emitir esta venta — se configura en Facturación (ARCA), no se elige por venta (salvo el CUIT opcional para Factura A). */
  readonly invoicingLabel = computed(() => {
    if (!this.facturaArcaActiva()) return '📄 Emite ticket interno';
    if (this.showBuyerCuitField()) {
      return this.buyerCuit().trim() ? '🧾 Emite Factura A (con CUIT)' : '🧾 Emite Factura B (consumidor final)';
    }
    return '🧾 Emite Factura C (ARCA)';
  });

  readonly paymentMethods = ['CASH', 'TRANSFER', 'POSNET'] as const satisfies readonly PaymentMethod[];
  readonly paymentLabels: Record<(typeof this.paymentMethods)[number], string> = {
    CASH: '💵 Efectivo',
    TRANSFER: '🏦 Transferencia',
    POSNET: '💳 Posnet',
  };

  readonly catalogStatus = this.productService.catalogStatus;
  readonly reloadCatalog = () => this.productService.reloadCatalog();
  private readonly products = this.productService.availableProducts;

  readonly search = signal('');

  /** Productos que matchean el buscador, por nombre o código de barras. */
  readonly matchingProducts = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return [];
    return this.products()
      .filter((p) => p.name.toLowerCase().includes(term) || p.barcode?.toLowerCase().includes(term))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 8);
  });

  /** Mismo criterio "beep, beep, beep" que en Venta en el local — ver ese componente. */
  onSearchEnter(): void {
    const term = this.search().trim();
    if (!term) return;
    const match = this.products().find((p) => p.barcode && p.barcode === term);
    if (match && match.sizeStocks.length === 1) {
      this.addProduct(match, match.sizeStocks[0].size);
      return;
    }
    // Sin match exacto de barcode: si sólo hay un resultado filtrado con un talle, sumarlo igual.
    const only = this.matchingProducts();
    if (only.length === 1 && only[0].sizeStocks.length === 1) {
      this.addProduct(only[0], only[0].sizeStocks[0].size);
    }
  }

  readonly lines = signal<KioscoLine[]>([]);
  readonly customerName = signal('');
  readonly paymentMethod = signal<PaymentMethod>('CASH');
  readonly saving = signal(false);

  readonly amountTendered = signal<number | null>(null);
  readonly transferSenderName = signal('');
  readonly posnetTicketNumber = signal('');

  readonly subtotal = computed(() => this.lines().reduce((sum, l) => sum + l.product.price * l.quantity, 0));
  readonly discount = computed(() =>
    this.discountService.computeCartDiscount(
      this.lines().map((l) => ({ product: l.product, quantity: l.quantity })),
      { paymentMethod: this.paymentMethod(), deliveryMethod: 'PICKUP' }
    )
  );
  readonly discountAmount = computed(() => this.discount().discountAmount);
  readonly total = computed(() => this.subtotal() - this.discountAmount());

  readonly change = computed(() => {
    const tendered = this.amountTendered();
    return tendered != null ? tendered - this.total() : null;
  });
  readonly cashInsufficient = computed(() => {
    const c = this.change();
    return c != null && c < 0;
  });

  constructor() {
    // Después de cada venta (o al arrancar), el cursor vuelve al buscador — así el
    // próximo escaneo entra directo sin que nadie tenga que clickear nada.
    effect(() => {
      this.lines();
      queueMicrotask(() => document.getElementById('kiosco-search')?.focus());
    });
  }

  stockOf(product: Product, size: string): number {
    return stockForSize(product, size);
  }

  addProduct(product: Product, size: string): void {
    const stock = stockForSize(product, size);
    if (stock <= 0) return;
    this.lines.update((list) => {
      const existing = list.find((l) => l.product.id === product.id && l.size === size);
      if (existing) {
        return list.map((l) => (l === existing ? { ...l, quantity: Math.min(l.quantity + 1, stock) } : l));
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

  private get paymentReferenceToSend(): string | null {
    switch (this.paymentMethod()) {
      case 'TRANSFER':
        return this.transferSenderName().trim() || null;
      case 'POSNET':
        return this.posnetTicketNumber().trim() || null;
      default:
        return null;
    }
  }

  get canSave(): boolean {
    return this.lines().length > 0 && !this.saving() && !this.cashInsufficient();
  }

  register(): void {
    if (!this.canSave) return;
    this.saving.set(true);
    this.orderService
      .createPos({
        customerName: this.customerName().trim() || 'Venta en el local',
        items: this.lines().map((l) => ({ productId: l.product.id, size: l.size, quantity: l.quantity })),
        paymentMethod: this.paymentMethod(),
        amountTendered: this.paymentMethod() === 'CASH' ? this.amountTendered() : null,
        paymentReference: this.paymentReferenceToSend,
        buyerCuit: this.showBuyerCuitField() ? this.buyerCuit().trim() || null : null,
      })
      .subscribe({
        next: (order) => {
          this.orderService.confirm(order.id).subscribe({
            next: (confirmed) => {
              this.saving.set(false);
              this.toast.success(`Venta registrada (${confirmed.code}).`);
              this.router.navigate(['/admin/recibo', confirmed.id]);
            },
            error: () => this.saving.set(false),
          });
        },
        error: () => this.saving.set(false),
      });
  }
}
