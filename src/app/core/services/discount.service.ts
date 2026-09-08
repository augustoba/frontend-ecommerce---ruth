import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CartDiscountResult,
  Discount,
  DiscountBreakdownLine,
  DiscountCombineMode,
} from '../models/discount.model';
import { Product, productHasParam } from '../models/product.model';
import { ParamService } from './param.service';
import { apiUrl } from '../config/site-config';
import { LoadStatus } from '../state/collection-store';

/** Ítem del carrito que necesita el cálculo de descuentos */
export interface DiscountCartItem {
  product: Product;
  quantity: number;
}

interface PublicDiscounts {
  discounts: Discount[];
  combineMode: DiscountCombineMode;
}

/**
 * Descuentos por monto y por parametría. Se leen de `/api/discounts` (público,
 * para el preview del carrito) y el CRUD va contra `/api/admin/discounts/**`.
 * `computeCartDiscount` es el mismo cálculo que hace el backend al crear el
 * pedido (acá sirve para el preview en vivo).
 */
@Injectable({ providedIn: 'root' })
export class DiscountService {
  private readonly http = inject(HttpClient);
  private readonly paramService = inject(ParamService);

  private readonly discountsSignal = signal<Discount[]>([]);
  private readonly combineModeSignal = signal<DiscountCombineMode>('MEJOR');
  private readonly statusSignal = signal<LoadStatus>('idle');
  readonly saving = signal(false);

  readonly discounts = this.discountsSignal.asReadonly();
  readonly combineMode = this.combineModeSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly loading = computed(() => this.statusSignal() === 'loading');
  readonly errored = computed(() => this.statusSignal() === 'error');

  readonly amountDiscounts = computed(() =>
    this.discountsSignal().filter((d) => d.kind === 'MONTO')
  );
  readonly paramDiscounts = computed(() =>
    this.discountsSignal().filter((d) => d.kind === 'PARAMETRO')
  );

  /** Vigente ahora: habilitado y dentro del rango de fechas (según el backend). */
  private isActive(d: Discount): boolean {
    return d.status ? d.status === 'ACTIVO' : d.enabled;
  }

  private readonly activeAmountTiers = computed(() =>
    this.discountsSignal()
      .filter((d) => d.kind === 'MONTO' && this.isActive(d) && (d.minAmount ?? 0) > 0)
      .sort((a, b) => (b.minAmount ?? 0) - (a.minAmount ?? 0))
  );

  constructor() {
    this.load();
  }

  reload = (): void => this.load();
  ensureLoaded(): void {
    if (this.statusSignal() === 'idle' || this.statusSignal() === 'error') this.load();
  }

  private load(): void {
    this.statusSignal.set('loading');
    this.http.get<PublicDiscounts>(apiUrl('/discounts')).subscribe({
      next: (res) => {
        this.discountsSignal.set(res.discounts ?? []);
        this.combineModeSignal.set(res.combineMode ?? 'MEJOR');
        this.statusSignal.set('loaded');
      },
      error: () => this.statusSignal.set('error'),
    });
  }

  // --- Consultas para el banner del carrito (solo descuentos por monto) ---

  bestAmountTierFor(subtotal: number): Discount | null {
    return this.activeAmountTiers().find((t) => subtotal >= (t.minAmount ?? 0)) ?? null;
  }

  nextAmountTierFor(subtotal: number): Discount | null {
    const notReached = this.activeAmountTiers()
      .filter((t) => subtotal < (t.minAmount ?? 0))
      .sort((a, b) => (a.minAmount ?? 0) - (b.minAmount ?? 0));
    return notReached[0] ?? null;
  }

  // --- Cálculo central (preview del carrito; el backend recalcula al confirmar) ---

  computeCartDiscount(items: DiscountCartItem[]): CartDiscountResult {
    const subtotal = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
    if (subtotal <= 0) {
      return { discountPercent: 0, discountAmount: 0, breakdown: [] };
    }

    const activeParamDiscounts = this.paramDiscounts().filter(
      (d) => this.isActive(d) && d.groupId && d.optionId
    );

    const paramByDiscountId = new Map<string, number>();
    let paramTotal = 0;
    for (const item of items) {
      const lineTotal = item.product.price * item.quantity;
      let bestPct = 0;
      let bestId: string | null = null;
      for (const d of activeParamDiscounts) {
        if (productHasParam(item.product, d.groupId!, d.optionId!) && d.discountPercent > bestPct) {
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

    const amountBase = mode === 'COMBINAR' ? subtotal - paramTotal : subtotal;
    const amountTier = this.bestAmountTierFor(amountBase);
    const amountValue = amountTier
      ? Math.round((amountBase * amountTier.discountPercent) / 100)
      : 0;

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

    if (mode === 'COMBINAR') {
      pushParamLines();
      pushAmountLine();
      discountAmount = paramTotal + amountValue;
    } else if (paramTotal >= amountValue) {
      pushParamLines();
      discountAmount = paramTotal;
    } else {
      pushAmountLine();
      discountAmount = amountValue;
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

  // --- CRUD (admin) ---

  add(discount: Omit<Discount, 'id'>): void {
    this.mutate(this.http.post(apiUrl('/admin/discounts'), discount));
  }

  /** Actualiza un descuento: mergea el patch con el actual y manda el objeto completo. */
  update(id: string, patch: Partial<Omit<Discount, 'id' | 'kind'>>): void {
    const current = this.discountsSignal().find((d) => d.id === id);
    if (!current) return;
    this.mutate(this.http.put(apiUrl(`/admin/discounts/${id}`), { ...current, ...patch }));
  }

  toggle(id: string): void {
    const current = this.discountsSignal().find((d) => d.id === id);
    if (!current) return;
    this.update(id, { enabled: !current.enabled });
  }

  remove(id: string): void {
    this.mutate(this.http.delete(apiUrl(`/admin/discounts/${id}`)));
  }

  setCombineMode(mode: DiscountCombineMode): void {
    this.mutate(this.http.put(apiUrl('/admin/discounts/config'), { combineMode: mode }));
  }

  private mutate(obs: Observable<unknown>): void {
    this.saving.set(true);
    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }
}

function formatArs(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-AR');
}
