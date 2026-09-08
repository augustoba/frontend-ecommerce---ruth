import { Injectable, computed, inject, signal } from '@angular/core';
import {
  CartDiscountResult,
  Discount,
  DiscountBreakdownLine,
  DiscountCombineMode,
} from '../models/discount.model';
import { Product, productHasParam } from '../models/product.model';
import { ParamService } from './param.service';

const LIST_KEY = 'pp_discounts';
const CONFIG_KEY = 'pp_discount_config';

const DEFAULT_DISCOUNTS: Discount[] = [
  { id: crypto.randomUUID(), kind: 'monto', minAmount: 100000, discountPercent: 20, enabled: true },
  { id: crypto.randomUUID(), kind: 'monto', minAmount: 200000, discountPercent: 25, enabled: true },
];

/** Ítem del carrito que necesita el cálculo de descuentos */
export interface DiscountCartItem {
  product: Product;
  quantity: number;
}

/**
 * Descuentos por monto de compra y por parametría, administrables desde
 * /admin/promociones. Se aplican SOLO en el carrito (los precios del catálogo
 * y la ficha no cambian). Reemplaza al viejo PromoService.
 */
@Injectable({ providedIn: 'root' })
export class DiscountService {
  private readonly paramService = inject(ParamService);

  private readonly discountsSignal = signal<Discount[]>(this.loadDiscounts());
  private readonly combineModeSignal = signal<DiscountCombineMode>(this.loadMode());

  readonly discounts = this.discountsSignal.asReadonly();
  readonly combineMode = this.combineModeSignal.asReadonly();

  readonly amountDiscounts = computed(() =>
    this.discountsSignal().filter((d) => d.kind === 'monto')
  );
  readonly paramDiscounts = computed(() =>
    this.discountsSignal().filter((d) => d.kind === 'parametro')
  );

  /** Tiers por monto habilitados, de mayor a menor monto mínimo */
  private readonly enabledAmountTiers = computed(() =>
    this.discountsSignal()
      .filter((d) => d.kind === 'monto' && d.enabled && (d.minAmount ?? 0) > 0)
      .sort((a, b) => (b.minAmount ?? 0) - (a.minAmount ?? 0))
  );

  // --- Consultas para el banner del carrito (solo descuentos por monto) ---

  /** El mejor tier por monto que ya se alcanzó para un subtotal dado */
  bestAmountTierFor(subtotal: number): Discount | null {
    return this.enabledAmountTiers().find((t) => subtotal >= (t.minAmount ?? 0)) ?? null;
  }

  /** El próximo tier por monto todavía no alcanzado */
  nextAmountTierFor(subtotal: number): Discount | null {
    const notReached = this.enabledAmountTiers()
      .filter((t) => subtotal < (t.minAmount ?? 0))
      .sort((a, b) => (a.minAmount ?? 0) - (b.minAmount ?? 0));
    return notReached[0] ?? null;
  }

  // --- Cálculo central ---

  /**
   * Calcula el descuento total para un carrito, combinando descuentos por
   * parámetro (por ítem) y por monto (por carrito) según el modo configurado.
   */
  computeCartDiscount(items: DiscountCartItem[]): CartDiscountResult {
    const subtotal = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
    if (subtotal <= 0) {
      return { discountPercent: 0, discountAmount: 0, breakdown: [] };
    }

    const activeParamDiscounts = this.paramDiscounts().filter(
      (d) => d.enabled && d.groupId && d.optionId
    );

    // 1) Descuento por parámetro, por ítem: el % más alto que aplica a ese ítem.
    const paramByDiscountId = new Map<string, number>();
    let paramTotal = 0;
    for (const item of items) {
      const lineTotal = item.product.price * item.quantity;
      let bestPct = 0;
      let bestId: string | null = null;
      for (const d of activeParamDiscounts) {
        if (
          productHasParam(item.product, d.groupId!, d.optionId!) &&
          d.discountPercent > bestPct
        ) {
          bestPct = d.discountPercent;
          bestId = d.id;
        }
      }
      if (bestId && bestPct > 0) {
        const amount = Math.round((lineTotal * bestPct) / 100);
        paramTotal += amount;
        paramByDiscountId.set(bestId, (paramByDiscountId.get(bestId) ?? 0) + amount);
      }
    }

    const mode = this.combineModeSignal();

    // 2) Descuento por monto.
    const amountBase = mode === 'combinar' ? subtotal - paramTotal : subtotal;
    const amountTier = this.bestAmountTierFor(amountBase);
    const amountValue = amountTier
      ? Math.round((amountBase * amountTier.discountPercent) / 100)
      : 0;

    // 3) Combinar resultados.
    const breakdown: DiscountBreakdownLine[] = [];
    let discountAmount = 0;

    const pushParamLines = () => {
      for (const [id, amount] of paramByDiscountId) {
        const d = this.discountsSignal().find((x) => x.id === id);
        if (!d || amount <= 0) continue;
        breakdown.push({ label: this.paramLabel(d), amount });
      }
    };
    const pushAmountLine = () => {
      if (amountTier && amountValue > 0) {
        breakdown.push({
          label: `Compra mayor a ${formatArs(amountTier.minAmount ?? 0)} (${amountTier.discountPercent}%)`,
          amount: amountValue,
        });
      }
    };

    if (mode === 'combinar') {
      pushParamLines();
      pushAmountLine();
      discountAmount = paramTotal + amountValue;
    } else {
      // 'mejor': se usa el camino que más ahorra
      if (paramTotal >= amountValue) {
        pushParamLines();
        discountAmount = paramTotal;
      } else {
        pushAmountLine();
        discountAmount = amountValue;
      }
    }

    discountAmount = Math.min(discountAmount, subtotal);
    const discountPercent = discountAmount > 0 ? Math.round((discountAmount / subtotal) * 100) : 0;

    return { discountPercent, discountAmount, breakdown };
  }

  private paramLabel(d: Discount): string {
    if (d.label) return d.label;
    const group = this.paramService.getGroup(d.groupId ?? '');
    const opt = this.paramService.labelFor(d.groupId ?? '', d.optionId ?? '');
    return `${group?.name ?? 'Parámetro'}: ${opt || '—'} (${d.discountPercent}%)`;
  }

  // --- CRUD ---

  add(discount: Omit<Discount, 'id'>): void {
    const full: Discount = { ...discount, id: crypto.randomUUID() };
    this.discountsSignal.update((list) => [...list, full]);
    this.persist();
  }

  update(id: string, patch: Partial<Omit<Discount, 'id' | 'kind'>>): void {
    this.discountsSignal.update((list) =>
      list.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
    this.persist();
  }

  toggle(id: string): void {
    this.discountsSignal.update((list) =>
      list.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d))
    );
    this.persist();
  }

  remove(id: string): void {
    this.discountsSignal.update((list) => list.filter((d) => d.id !== id));
    this.persist();
  }

  setCombineMode(mode: DiscountCombineMode): void {
    this.combineModeSignal.set(mode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CONFIG_KEY, JSON.stringify({ combineMode: mode }));
    }
  }

  resetToDefaults(): void {
    this.discountsSignal.set(DEFAULT_DISCOUNTS.map((d) => ({ ...d, id: crypto.randomUUID() })));
    this.combineModeSignal.set('mejor');
    this.persist();
    this.setCombineMode('mejor');
  }

  // --- Persistencia ---

  private loadDiscounts(): Discount[] {
    if (typeof localStorage === 'undefined') return DEFAULT_DISCOUNTS;
    try {
      const raw = localStorage.getItem(LIST_KEY);
      if (!raw) return DEFAULT_DISCOUNTS;
      const parsed = JSON.parse(raw) as Discount[];
      return Array.isArray(parsed) ? parsed : DEFAULT_DISCOUNTS;
    } catch {
      return DEFAULT_DISCOUNTS;
    }
  }

  private loadMode(): DiscountCombineMode {
    if (typeof localStorage === 'undefined') return 'mejor';
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (!raw) return 'mejor';
      const parsed = JSON.parse(raw) as { combineMode?: DiscountCombineMode };
      return parsed.combineMode === 'combinar' ? 'combinar' : 'mejor';
    } catch {
      return 'mejor';
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(LIST_KEY, JSON.stringify(this.discountsSignal()));
  }
}

function formatArs(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-AR');
}
