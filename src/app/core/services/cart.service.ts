import { Injectable, computed, inject, signal } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import { Product, ProductSize } from '../models/product.model';
import { ProductService } from './product.service';

const STORAGE_KEY = 'pp_cart';

interface CartEntry {
  productId: string;
  size: ProductSize;
  quantity: number;
}

/**
 * Carrito. Vive **solo en `localStorage`** (es local del navegador, no va al
 * backend). Guarda `{productId, size, quantity}` y arma los `CartItem`
 * completos juntándolos con los productos del catálogo (`ProductService`), así
 * se rehidrata solo cuando llegan los productos.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly productService = inject(ProductService);

  private readonly entries = signal<CartEntry[]>(this.loadEntries());

  /** Ítems completos: entradas del storage + producto del catálogo. */
  readonly items = computed<CartItem[]>(() => {
    const products = this.productService.availableProducts();
    return this.entries()
      .map((e) => {
        const product = products.find((p) => p.id === e.productId);
        return product ? ({ product, size: e.size, quantity: e.quantity } satisfies CartItem) : null;
      })
      .filter((i): i is CartItem => i !== null);
  });

  readonly totalItems = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly totalPrice = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity * item.product.price, 0)
  );

  readonly isEmpty = computed(() => this.items().length === 0);

  add(product: Product, size: ProductSize, quantity = 1): void {
    this.entries.update((list) => {
      const existing = list.find((e) => e.productId === product.id && e.size === size);
      if (existing) {
        return list.map((e) => (e === existing ? { ...e, quantity: e.quantity + quantity } : e));
      }
      return [...list, { productId: product.id, size, quantity }];
    });
    this.persist();
  }

  updateQuantity(productId: string, size: ProductSize, quantity: number): void {
    if (quantity < 1) {
      this.remove(productId, size);
      return;
    }
    this.entries.update((list) =>
      list.map((e) => (e.productId === productId && e.size === size ? { ...e, quantity } : e))
    );
    this.persist();
  }

  remove(productId: string, size: ProductSize): void {
    this.entries.update((list) =>
      list.filter((e) => !(e.productId === productId && e.size === size))
    );
    this.persist();
  }

  clear(): void {
    this.entries.set([]);
    this.persist();
  }

  private loadEntries(): CartEntry[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as CartEntry[]) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries()));
  }
}
