import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CartDiscountResult,
  Discount,
  DiscountBreakdownLine,
} from '../models/discount.model';
import { DeliveryMethod, PaymentMethod } from '../models/order.model';
import { Product, productHasParam } from '../models/product.model';
import { ParamService } from './param.service';
import { apiUrl } from '../config/site-config';
import { LoadStatus } from '../state/collection-store';

/** Ítem del carrito que necesita el cálculo de descuentos */
export interface DiscountCartItem {
  product: Product;
  quantity: number;
}

/** Contexto del carrito para el cálculo (entrega + pago elegidos). */
export interface DiscountContext {
  paymentMethod?: PaymentMethod | null;
  deliveryMethod?: DeliveryMethod | null;
}

interface PublicDiscounts {
  discounts: Discount[];
}

/** Una instancia de descuento que aplica al carrito. */
interface DiscountInstance {
  discount: Discount;
  /** Lo que ahorraría si fuera el único, sobre el subtotal. */
  standaloneAmount: number;
  label: string;
}

/**
 * Descuentos configurables. Se leen de `/api/discounts` (público, para el preview
 * del carrito). `computeCartDiscount` es el mismo cálculo que hace el backend al
 * crear el pedido:
 *  - si TODOS los descuentos que aplican son acumulables → se combinan en cascada;
 *  - si hay al menos uno NO acumulable → se aplica sólo el que más ahorra.
 *  - "envío gratis" es aparte (informativo).
 */
@Injectable({ providedIn: 'root' })
export class DiscountService {
  private readonly http = inject(HttpClient);
  private readonly paramService = inject(ParamService);

  private readonly discountsSignal = signal<Discount[]>([]);
  private readonly statusSignal = signal<LoadStatus>('idle');
  readonly saving = signal(false);

  readonly discounts = this.discountsSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly loading = computed(() => this.statusSignal() === 'loading');
  readonly errored = computed(() => this.statusSignal() === 'error');

  readonly amountDiscounts = computed(() => this.discountsSignal().filter((d) => d.kind === 'MONTO'));
  readonly paramDiscounts = computed(() => this.discountsSignal().filter((d) => d.kind === 'PARAMETRO'));
  readonly paymentDiscounts = computed(() => this.discountsSignal().filter((d) => d.kind === 'PAGO'));
  readonly freeShippingDiscounts = computed(() =>
    this.discountsSignal().filter((d) => d.kind === 'ENVIO_GRATIS')
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
        this.statusSignal.set('loaded');
      },
      error: () => this.statusSignal.set('error'),
    });
  }

  // --- Banners del carrito ---

  bestAmountTierFor(subtotal: number): Discount | null {
    return this.activeAmountTiers().find((t) => subtotal >= (t.minAmount ?? 0)) ?? null;
  }

  nextAmountTierFor(subtotal: number): Discount | null {
    const notReached = this.activeAmountTiers()
      .filter((t) => subtotal < (t.minAmount ?? 0))
      .sort((a, b) => (a.minAmount ?? 0) - (b.minAmount ?? 0));
    return notReached[0] ?? null;
  }

  /** El próximo escalón de "envío gratis" todavía no alcanzado. */
  nextFreeShippingTierFor(subtotal: number): Discount | null {
    return this.freeShippingDiscounts()
      .filter((d) => this.isActive(d) && (d.minAmount ?? 0) > 0 && subtotal < (d.minAmount ?? 0))
      .sort((a, b) => (a.minAmount ?? 0) - (b.minAmount ?? 0))[0] ?? null;
  }

  /** El mejor "envío gratis" que el subtotal ya alcanza (sin importar la entrega elegida). */
  bestFreeShippingFor(subtotal: number): Discount | null {
    return this.freeShippingDiscounts()
      .filter((d) => this.isActive(d) && subtotal >= (d.minAmount ?? 0))
      .sort((a, b) => (b.minAmount ?? 0) - (a.minAmount ?? 0))[0] ?? null;
  }

  /** Descuentos por medio de pago vigentes (para mostrarlos como promo en el carrito). */
  readonly activePaymentDiscounts = computed(() =>
    this.paymentDiscounts().filter(
      (d) => this.isActive(d) && d.discountPercent > 0 && (d.paymentMethods ?? []).length > 0
    )
  );

  // --- Cálculo central ---

  computeCartDiscount(items: DiscountCartItem[], ctx: DiscountContext = {}): CartDiscountResult {
    const subtotal = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);

    const freeShipping = this.freeShippingFor(subtotal, ctx.deliveryMethod ?? null);

    if (subtotal <= 0) {
      return { discountPercent: 0, discountAmount: 0, breakdown: [], freeShipping };
    }

    // --- Descuento por parámetro: por ítem, el % más alto que aplica ---
    const activeParamDiscounts = this.paramDiscounts().filter(
      (d) => this.isActive(d) && d.groupId && d.optionId
    );
    const paramByDiscountId = new Map<string, number>();
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
        paramByDiscountId.set(bestId, (paramByDiscountId.get(bestId) ?? 0) + amount);
      }
    }

    // --- Instancias (parámetro, monto, pago) ---
    const instances: DiscountInstance[] = [];
    for (const [id, amount] of paramByDiscountId) {
      const d = this.discountsSignal().find((x) => x.id === id);
      if (d && amount > 0) instances.push({ discount: d, standaloneAmount: amount, label: this.paramLabel(d) });
    }

    const amountTier = this.bestAmountTierFor(subtotal);
    if (amountTier) {
      instances.push({
        discount: amountTier,
        standaloneAmount: Math.round((subtotal * amountTier.discountPercent) / 100),
        label: this.amountLabel(amountTier),
      });
    }

    const pm = ctx.paymentMethod ?? null;
    if (pm) {
      for (const d of this.paymentDiscounts()) {
        if (this.isActive(d) && (d.paymentMethods ?? []).includes(pm) && d.discountPercent > 0) {
          instances.push({
            discount: d,
            standaloneAmount: Math.round((subtotal * d.discountPercent) / 100),
            label: this.pagoLabel(d),
          });
        }
      }
    }

    const breakdown: DiscountBreakdownLine[] = [];
    let discountAmount = 0;

    if (instances.length === 0) {
      discountAmount = 0;
    } else if (instances.every((i) => i.discount.stackable)) {
      // Todos acumulables → cascada (menor descuento total).
      const order: Record<string, number> = { PARAMETRO: 0, MONTO: 1, PAGO: 2 };
      instances.sort((a, b) => (order[a.discount.kind] ?? 9) - (order[b.discount.kind] ?? 9));
      let remaining = subtotal;
      for (const inst of instances) {
        const step = Math.round((remaining * inst.standaloneAmount) / subtotal);
        if (step > 0) {
          breakdown.push({ label: inst.label, amount: step, detail: inst.discount.detail ?? null });
          discountAmount += step;
          remaining -= step;
        }
      }
    } else {
      // Hay al menos uno no acumulable → sólo el que más ahorra.
      const best = instances.reduce((a, b) => (b.standaloneAmount > a.standaloneAmount ? b : a));
      discountAmount = best.standaloneAmount;
      breakdown.push({ label: best.label, amount: discountAmount, detail: best.discount.detail ?? null });
    }

    discountAmount = Math.min(discountAmount, subtotal);
    const discountPercent = discountAmount > 0 ? Math.round((discountAmount / subtotal) * 100) : 0;
    return { discountPercent, discountAmount, breakdown, freeShipping };
  }

  private freeShippingFor(
    subtotal: number,
    deliveryMethod: DeliveryMethod | null
  ): { label: string; detail: string | null } | null {
    if (deliveryMethod !== 'SHIPPING') return null;
    const reached = this.bestFreeShippingFor(subtotal);
    if (!reached) return null;
    return { label: reached.label?.trim() || 'Envío gratis', detail: reached.detail?.trim() || null };
  }

  private amountLabel(d: Discount): string {
    return d.label?.trim() || `Compra mayor a ${formatArs(d.minAmount ?? 0)} (${d.discountPercent}%)`;
  }

  private pagoLabel(d: Discount): string {
    return d.label?.trim() || `Descuento por medio de pago (${d.discountPercent}%)`;
  }

  private paramLabel(d: Discount): string {
    if (d.label?.trim()) return d.label.trim();
    const group = this.paramService.getGroup(d.groupId ?? '');
    const opt = this.paramService.labelFor(d.groupId ?? '', d.optionId ?? '');
    return `${group?.name ?? 'Parámetro'}: ${opt || '—'} (${d.discountPercent}%)`;
  }

  // --- CRUD (admin) ---

  add(discount: Omit<Discount, 'id'>): void {
    this.mutate(this.http.post(apiUrl('/admin/discounts'), discount));
  }

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

  toggleStackable(id: string): void {
    const current = this.discountsSignal().find((d) => d.id === id);
    if (!current) return;
    this.update(id, { stackable: !current.stackable });
  }

  remove(id: string): void {
    this.mutate(this.http.delete(apiUrl(`/admin/discounts/${id}`)));
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
