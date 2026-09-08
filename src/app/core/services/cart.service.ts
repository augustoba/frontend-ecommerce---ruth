import { Injectable, computed, inject, signal } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import { Product, ProductSize } from '../models/product.model';
import { ProductService } from './product.service';

const STORAGE_KEY = 'pp_cart';

interface PersistedCartItem {
  productId: string;
  size: ProductSize;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly productService = inject(ProductService);

  private readonly itemsSignal = signal<CartItem[]>(this.loadInitial());

  readonly items = this.itemsSignal.asReadonly();

  readonly totalItems = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly totalPrice = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity * item.product.price, 0)
  );

  readonly isEmpty = computed(() => this.itemsSignal().length === 0);

  add(product: Product, size: ProductSize, quantity = 1): void {
    this.itemsSignal.update((items) => {
      const existing = items.find((i) => i.product.id === product.id && i.size === size);
      if (existing) {
        return items.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...items, { product, size, quantity }];
    });
    this.persist();
  }

  updateQuantity(productId: string, size: ProductSize, quantity: number): void {
    if (quantity < 1) {
      this.remove(productId, size);
      return;
    }
    this.itemsSignal.update((items) =>
      items.map((i) =>
        i.product.id === productId && i.size === size ? { ...i, quantity } : i
      )
    );
    this.persist();
  }

  remove(productId: string, size: ProductSize): void {
    this.itemsSignal.update((items) =>
      items.filter((i) => !(i.product.id === productId && i.size === size))
    );
    this.persist();
  }

  clear(): void {
    this.itemsSignal.set([]);
    this.persist();
  }

  private loadInitial(): CartItem[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as PersistedCartItem[];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((entry) => {
          const product = this.productService.getById(entry.productId);
          if (!product) return null;
          return { product, size: entry.size, quantity: entry.quantity } satisfies CartItem;
        })
        .filter((item): item is CartItem => item !== null);
    } catch {
      return [];
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    const toStore: PersistedCartItem[] = this.itemsSignal().map((i) => ({
      productId: i.product.id,
      size: i.size,
      quantity: i.quantity,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  }
}
