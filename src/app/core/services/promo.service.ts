import { Injectable, computed, signal } from '@angular/core';
import { PromoTier } from '../models/promo.model';

const STORAGE_KEY = 'pp_promo_tiers';

const DEFAULT_TIERS: PromoTier[] = [
  { id: crypto.randomUUID(), minAmount: 100000, discountPercent: 20, enabled: true },
  { id: crypto.randomUUID(), minAmount: 200000, discountPercent: 25, enabled: true },
];

/**
 * Descuentos por monto de compra ("compra mayor a $X → Y% off"),
 * administrables desde /admin/promociones. Se aplican SOLO en el carrito
 * (los precios del catálogo y la ficha de producto no cambian) — el
 * descuento con mayor monto mínimo alcanzado es el que se usa (no se
 * acumulan varios).
 */
@Injectable({ providedIn: 'root' })
export class PromoService {
  private readonly tiersSignal = signal<PromoTier[]>(this.loadInitial());

  readonly tiers = this.tiersSignal.asReadonly();

  /** Tiers habilitados, de mayor a menor monto mínimo */
  readonly enabledTiers = computed(() =>
    [...this.tiersSignal()].filter((t) => t.enabled).sort((a, b) => b.minAmount - a.minAmount)
  );

  /** El mejor descuento aplicable para un subtotal dado, o null si ninguno alcanza */
  bestTierFor(subtotal: number): PromoTier | null {
    return this.enabledTiers().find((t) => subtotal >= t.minAmount) ?? null;
  }

  /** El próximo escalón todavía no alcanzado (para mostrar "te faltan $X para Y% off") */
  nextTierFor(subtotal: number): PromoTier | null {
    const notReached = this.enabledTiers()
      .filter((t) => subtotal < t.minAmount)
      .sort((a, b) => a.minAmount - b.minAmount);
    return notReached[0] ?? null;
  }

  add(minAmount: number, discountPercent: number): void {
    const tier: PromoTier = { id: crypto.randomUUID(), minAmount, discountPercent, enabled: true };
    this.tiersSignal.update((list) => [...list, tier]);
    this.persist();
  }

  update(id: string, minAmount: number, discountPercent: number): void {
    this.tiersSignal.update((list) =>
      list.map((t) => (t.id === id ? { ...t, minAmount, discountPercent } : t))
    );
    this.persist();
  }

  toggle(id: string): void {
    this.tiersSignal.update((list) =>
      list.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
    this.persist();
  }

  remove(id: string): void {
    this.tiersSignal.update((list) => list.filter((t) => t.id !== id));
    this.persist();
  }

  private loadInitial(): PromoTier[] {
    if (typeof localStorage === 'undefined') return DEFAULT_TIERS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_TIERS;
      const parsed = JSON.parse(raw) as PromoTier[];
      return Array.isArray(parsed) ? parsed : DEFAULT_TIERS;
    } catch {
      return DEFAULT_TIERS;
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tiersSignal()));
  }
}
