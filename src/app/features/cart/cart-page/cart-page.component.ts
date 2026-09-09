import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { WhatsappService } from '../../../core/services/whatsapp.service';
import { OrderService } from '../../../core/services/order.service';
import { DiscountService } from '../../../core/services/discount.service';
import { SettingsService } from '../../../core/services/settings.service';
import { QuantityStepperComponent } from '../../../shared/components/quantity-stepper/quantity-stepper.component';
import {
  AddressPickerComponent,
  PickedAddress,
} from '../../../shared/components/address-picker/address-picker.component';
import { Product, ProductSize, stockForSize } from '../../../core/models/product.model';
import { DeliveryMethod, Order, PaymentMethod, PAYMENT_LABELS } from '../../../core/models/order.model';
import { rememberOrder } from '../../../core/utils/remembered-orders';

@Component({
  selector: 'app-cart-page',
  imports: [CurrencyPipe, FormsModule, RouterLink, QuantityStepperComponent, AddressPickerComponent],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css',
})
export class CartPageComponent {
  private readonly cartService = inject(CartService);
  private readonly whatsappService = inject(WhatsappService);
  private readonly orderService = inject(OrderService);
  private readonly discountService = inject(DiscountService);
  private readonly settingsService = inject(SettingsService);

  readonly items = this.cartService.items;
  readonly totalItems = this.cartService.totalItems;
  readonly subtotal = this.cartService.totalPrice;
  readonly isEmpty = this.cartService.isEmpty;

  readonly paymentLabels = PAYMENT_LABELS;
  readonly storeAddress = computed(() => this.settingsService.settings().storeAddress?.trim() || null);
  readonly paymentOptions = this.settingsService.availablePaymentMethods;

  /** Descuento total del carrito (monto / parametría / medio de pago) con su detalle */
  readonly discount = computed(() =>
    this.discountService.computeCartDiscount(
      this.items().map((i) => ({ product: i.product, quantity: i.quantity })),
      { paymentMethod: this.paymentMethod(), deliveryMethod: this.deliveryMethod() }
    )
  );

  readonly discountAmount = computed(() => this.discount().discountAmount);
  readonly discountPercent = computed(() => this.discount().discountPercent);
  readonly discountBreakdown = computed(() => this.discount().breakdown);
  readonly freeShipping = computed(() => this.discount().freeShipping);
  readonly finalTotal = computed(() => this.subtotal() - this.discountAmount());

  /** Próximo escalón por monto todavía no alcanzado, para mostrar "te faltan $X" */
  readonly nextPromo = computed(() => this.discountService.nextAmountTierFor(this.subtotal()));
  readonly amountToNextPromo = computed(() => {
    const next = this.nextPromo();
    return next ? (next.minAmount ?? 0) - this.subtotal() : 0;
  });

  /** Próximo escalón de "envío gratis" — para "te faltan $X para envío gratis" */
  readonly nextFreeShipping = computed(() =>
    this.discountService.nextFreeShippingTierFor(this.subtotal())
  );
  readonly amountToFreeShipping = computed(() => {
    const next = this.nextFreeShipping();
    return next ? (next.minAmount ?? 0) - this.subtotal() : 0;
  });

  /** Otras promos que el cliente todavía podría aprovechar (además de las ya aplicadas). */
  readonly promoHints = computed<{ icon: string; text: string; detail?: string | null }[]>(() => {
    const hints: { icon: string; text: string; detail?: string | null }[] = [];
    const subtotal = this.subtotal();
    if (subtotal <= 0) return hints;

    // próximo escalón por monto (aunque ya tenga otro descuento aplicado)
    const nt = this.nextPromo();
    if (nt) {
      hints.push({
        icon: '🛍️',
        text: `Comprá ${fmtArs(this.amountToNextPromo())} más y llegás a ${nt.discountPercent}% de descuento`,
      });
    }

    // descuentos por medio de pago que todavía no elegiste
    const chosen = this.paymentMethod();
    for (const d of this.discountService.activePaymentDiscounts()) {
      const methods = d.paymentMethods ?? [];
      if (chosen && methods.includes(chosen)) continue; // ese descuento ya lo estás usando
      const names = methods.map((m) => this.paymentLabels[m]).join(' o ');
      hints.push({ icon: '💳', text: `Pagando con ${names}: ${d.discountPercent}% off`, detail: d.detail });
    }

    // envío gratis (cuando todavía no elegiste envío)
    if (this.deliveryMethod() !== 'SHIPPING') {
      const reached = this.discountService.bestFreeShippingFor(subtotal);
      const next = this.nextFreeShipping();
      if (reached) {
        hints.push({
          icon: '🚚',
          text: 'Tu compra tiene envío gratis — elegí "Envío a domicilio"',
          detail: reached.detail,
        });
      } else if (next) {
        hints.push({
          icon: '🚚',
          text: `Comprá ${fmtArs(this.amountToFreeShipping())} más y el envío a domicilio sale gratis`,
          detail: next.detail,
        });
      }
    }

    return hints;
  });

  /**
   * Líneas del carrito cuya cantidad ya no entra en el stock actual (el stock
   * pudo bajar después de agregar la prenda). Se muestra un aviso y no se deja
   * comprar hasta ajustarlas.
   */
  readonly stockProblems = computed(() =>
    this.items()
      .map((item) => ({ item, available: stockForSize(item.product, item.size) }))
      .filter((x) => x.item.quantity > x.available)
  );
  readonly hasStockProblems = computed(() => this.stockProblems().length > 0);

  /** Ajusta la cantidad de una línea al stock disponible (o la saca si es 0). */
  fixToStock(productId: string, size: ProductSize, available: number): void {
    if (available <= 0) this.cartService.remove(productId, size);
    else this.cartService.updateQuantity(productId, size, available);
  }

  readonly customerName = signal(loadStored(CUSTOMER_NAME_KEY));

  /** Guarda el nombre en localStorage para precargarlo la próxima vez. */
  setCustomerName(value: string): void {
    this.customerName.set(value);
    try {
      if (value.trim()) localStorage.setItem(CUSTOMER_NAME_KEY, value.trim());
      else localStorage.removeItem(CUSTOMER_NAME_KEY);
    } catch {
      /* ignore */
    }
  }

  readonly deliveryMethod = signal<DeliveryMethod | null>(null);
  readonly shippingAddr = signal<PickedAddress | null>(null);
  readonly shippingReference = signal('');
  readonly paymentMethod = signal<PaymentMethod | null>(null);
  readonly submitted = signal(false);

  readonly orderSent = signal(false);
  readonly sending = signal(false);
  /** Pedido ya creado para este carrito (se reusa si el cliente reabre WhatsApp) */
  readonly currentOrder = signal<Order | null>(null);

  /** Falta la dirección cuando eligió envío pero todavía no confirmó una. */
  readonly shippingAddressMissing = computed(
    () => this.deliveryMethod() === 'SHIPPING' && !this.shippingAddr()
  );
  /** Si la dirección no se ubicó exacta, la referencia (entre qué calles) es obligatoria. */
  readonly referenceRequired = computed(
    () => this.deliveryMethod() === 'SHIPPING' && !!this.shippingAddr()?.approximate
  );
  readonly referenceMissing = computed(
    () => this.referenceRequired() && !this.shippingReference().trim()
  );
  readonly canSend = computed(() => {
    if (this.hasStockProblems()) return false;
    if (!this.deliveryMethod() || this.shippingAddressMissing() || this.referenceMissing()) return false;
    // si el negocio todavía no cargó medios de pago, se coordina por WhatsApp
    if (this.paymentOptions().length === 0) return true;
    return !!this.paymentMethod() && this.paymentOptions().includes(this.paymentMethod()!);
  });

  updateQuantity(productId: string, size: ProductSize, quantity: number): void {
    this.cartService.updateQuantity(productId, size, quantity);
  }

  stockOf(product: Product, size: ProductSize): number {
    return stockForSize(product, size);
  }

  remove(productId: string, size: ProductSize): void {
    this.cartService.remove(productId, size);
  }

  clearCart(): void {
    this.cartService.clear();
    this.orderSent.set(false);
    this.currentOrder.set(null);
    this.submitted.set(false);
  }

  onAddressPicked(addr: PickedAddress | null): void {
    this.shippingAddr.set(addr);
  }

  sendOrder(): void {
    if (this.isEmpty() || this.sending()) return;

    const existing = this.currentOrder();
    if (existing) {
      this.whatsappService.openOrderChat(existing);
      this.orderSent.set(true);
      return;
    }

    this.submitted.set(true);
    if (!this.canSend()) return;

    const isShipping = this.deliveryMethod() === 'SHIPPING';
    const addr = this.shippingAddr();

    this.sending.set(true);
    this.orderService
      .create(this.customerName(), this.items(), {
        deliveryMethod: this.deliveryMethod()!,
        shippingAddress: isShipping ? (addr?.address ?? null) : null,
        shippingReference: isShipping ? this.shippingReference().trim() || null : null,
        shippingLat: isShipping ? (addr?.lat ?? null) : null,
        shippingLng: isShipping ? (addr?.lng ?? null) : null,
        paymentMethod: this.paymentMethod()!,
      })
      .subscribe({
        next: (order) => {
          this.sending.set(false);
          this.currentOrder.set(order);
          this.orderSent.set(true);
          rememberOrder(order.code, this.customerName());
          this.whatsappService.openOrderChat(order);
        },
        error: () => this.sending.set(false),
      });
  }
}

const CUSTOMER_NAME_KEY = 'pp_customer_name';

function loadStored(key: string): string {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function fmtArs(value: number): string {
  return '$' + Math.round(Math.max(0, value)).toLocaleString('es-AR');
}
