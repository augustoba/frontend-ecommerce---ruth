import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { WhatsappService } from '../../../core/services/whatsapp.service';
import { OrderService } from '../../../core/services/order.service';
import { DiscountService } from '../../../core/services/discount.service';
import { QuantityStepperComponent } from '../../../shared/components/quantity-stepper/quantity-stepper.component';
import { Product, ProductSize, stockForSize } from '../../../core/models/product.model';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-cart-page',
  imports: [CurrencyPipe, FormsModule, RouterLink, QuantityStepperComponent],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css',
})
export class CartPageComponent {
  private readonly cartService = inject(CartService);
  private readonly whatsappService = inject(WhatsappService);
  private readonly orderService = inject(OrderService);
  private readonly discountService = inject(DiscountService);

  readonly items = this.cartService.items;
  readonly totalItems = this.cartService.totalItems;
  readonly subtotal = this.cartService.totalPrice;
  readonly isEmpty = this.cartService.isEmpty;

  /** Descuento total del carrito (por monto y/o por parametría) con su detalle */
  readonly discount = computed(() =>
    this.discountService.computeCartDiscount(
      this.items().map((i) => ({ product: i.product, quantity: i.quantity }))
    )
  );

  readonly discountAmount = computed(() => this.discount().discountAmount);
  readonly discountPercent = computed(() => this.discount().discountPercent);
  readonly discountBreakdown = computed(() => this.discount().breakdown);
  readonly finalTotal = computed(() => this.subtotal() - this.discountAmount());

  /** Próximo escalón por monto todavía no alcanzado, para mostrar "te faltan $X" */
  readonly nextPromo = computed(() => this.discountService.nextAmountTierFor(this.subtotal()));
  readonly amountToNextPromo = computed(() => {
    const next = this.nextPromo();
    return next ? (next.minAmount ?? 0) - this.subtotal() : 0;
  });

  readonly customerName = signal('');
  readonly orderSent = signal(false);
  /** Pedido ya creado para este carrito (se reusa si el cliente reabre WhatsApp) */
  readonly currentOrder = signal<Order | null>(null);

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
  }

  sendOrder(): void {
    if (this.isEmpty()) return;

    let order = this.currentOrder();
    if (!order) {
      order = this.orderService.create(this.customerName(), this.items());
      this.currentOrder.set(order);
    }

    this.whatsappService.openOrderChat(order);
    this.orderSent.set(true);
  }
}
