import { Component, computed, effect, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ExchangeService } from '../../../core/services/exchange.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, stockForSize } from '../../../core/models/product.model';
import { PaymentMethod, PAYMENT_LABELS } from '../../../core/models/order.model';

interface XLine {
  product: Product;
  size: string;
  quantity: number;
}

/**
 * Registrar un cambio de prenda hecho en el local: lo que el cliente devuelve
 * (vuelve al stock) y lo que se lleva (sale del stock). Si lo que se lleva vale
 * más, se cobra la diferencia.
 */
@Component({
  selector: 'app-admin-exchange-new',
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './admin-exchange-new.component.html',
})
export class AdminExchangeNewComponent {
  private readonly productService = inject(ProductService);
  private readonly exchangeService = inject(ExchangeService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly paymentLabels = PAYMENT_LABELS;
  readonly paymentMethods: PaymentMethod[] = ['CASH', 'TRANSFER', 'QR_TRANSFER', 'QR_CARD'];

  readonly catalogStatus = this.productService.catalogStatus;
  readonly reloadCatalog = () => this.productService.reloadCatalog();
  private readonly products = this.productService.availableProducts;

  /** Qué lado se está cargando al tocar un talle. */
  readonly mode = signal<'returned' | 'taken'>('returned');

  readonly search = signal('');
  readonly matchingProducts = computed(() => {
    const term = this.search().trim().toLowerCase();
    const list = term
      ? this.products().filter((p) => p.name.toLowerCase().includes(term))
      : this.products();
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  });
  private readonly PAGE_SIZE = 9;
  readonly shownCount = signal(this.PAGE_SIZE);
  readonly visibleProducts = computed(() => this.matchingProducts().slice(0, this.shownCount()));
  readonly hasMore = computed(() => this.matchingProducts().length > this.shownCount());
  showMore(): void {
    this.shownCount.update((n) => n + this.PAGE_SIZE);
  }

  readonly returned = signal<XLine[]>([]);
  readonly taken = signal<XLine[]>([]);
  readonly customerName = signal('');
  readonly note = signal('');
  readonly paymentMethod = signal<PaymentMethod | null>('CASH');
  readonly saving = signal(false);

  constructor() {
    effect(() => {
      this.search();
      this.shownCount.set(this.PAGE_SIZE);
    });
  }

  readonly returnedTotal = computed(() =>
    this.returned().reduce((s, l) => s + l.product.price * l.quantity, 0)
  );
  readonly takenTotal = computed(() =>
    this.taken().reduce((s, l) => s + l.product.price * l.quantity, 0)
  );
  readonly difference = computed(() => this.takenTotal() - this.returnedTotal());

  stockOf(product: Product, size: string): number {
    return stockForSize(product, size);
  }

  addSize(product: Product, size: string): void {
    const side = this.mode() === 'returned' ? this.returned : this.taken;
    const isTaken = this.mode() === 'taken';
    if (isTaken && stockForSize(product, size) <= 0) return;
    side.update((list) => {
      const existing = list.find((l) => l.product.id === product.id && l.size === size);
      if (existing) {
        const max = isTaken ? stockForSize(product, size) : 99;
        return list.map((l) =>
          l === existing ? { ...l, quantity: Math.min(l.quantity + 1, max) } : l
        );
      }
      return [...list, { product, size, quantity: 1 }];
    });
  }

  setQty(side: 'returned' | 'taken', index: number, qty: number): void {
    const sig = side === 'returned' ? this.returned : this.taken;
    sig.update((list) =>
      list
        .map((l, i) => {
          if (i !== index) return l;
          const max = side === 'taken' ? stockForSize(l.product, l.size) : 99;
          return { ...l, quantity: Math.max(1, Math.min(qty, max)) };
        })
        .filter((l) => l.quantity > 0)
    );
  }

  removeLine(side: 'returned' | 'taken', index: number): void {
    const sig = side === 'returned' ? this.returned : this.taken;
    sig.update((list) => list.filter((_, i) => i !== index));
  }

  get canSave(): boolean {
    return this.returned().length > 0 && this.taken().length > 0 && !this.saving();
  }

  register(): void {
    if (!this.canSave) return;
    this.saving.set(true);
    const toItems = (l: XLine) => ({ productId: l.product.id, size: l.size, quantity: l.quantity });
    this.exchangeService
      .create({
        customerName: this.customerName().trim() || 'Cambio en el local',
        returned: this.returned().map(toItems),
        taken: this.taken().map(toItems),
        paymentMethod: this.difference() > 0 ? this.paymentMethod() : null,
        note: this.note().trim() || null,
      })
      .subscribe({
        next: (ex) => {
          this.saving.set(false);
          this.toast.success(`Cambio registrado (${ex.code}). Stock actualizado.`);
          this.router.navigate(['/admin/cambios']);
        },
        error: () => this.saving.set(false),
      });
  }
}
