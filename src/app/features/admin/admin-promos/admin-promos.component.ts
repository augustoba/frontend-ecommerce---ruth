import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { DiscountService } from '../../../core/services/discount.service';
import { ParamService } from '../../../core/services/param.service';
import { Discount } from '../../../core/models/discount.model';
import { PAYMENT_LABELS, PaymentMethod } from '../../../core/models/order.model';

const PAYMENT_METHODS: PaymentMethod[] = ['TRANSFER', 'QR_TRANSFER', 'QR_CARD', 'CASH'];

@Component({
  selector: 'app-admin-promos',
  imports: [FormsModule, NgTemplateOutlet],
  templateUrl: './admin-promos.component.html',
  styleUrl: './admin-promos.component.css',
})
export class AdminPromosComponent {
  private readonly discountService = inject(DiscountService);
  private readonly paramService = inject(ParamService);

  readonly amountDiscounts = this.discountService.amountDiscounts;
  readonly paramDiscounts = this.discountService.paramDiscounts;
  readonly paymentDiscounts = this.discountService.paymentDiscounts;
  readonly freeShippingDiscounts = this.discountService.freeShippingDiscounts;
  readonly groups = this.paramService.groups;
  readonly status = this.discountService.status;
  readonly saving = this.discountService.saving;
  readonly reload = () => this.discountService.reload();

  readonly paymentMethods = PAYMENT_METHODS;
  readonly paymentLabels = PAYMENT_LABELS;

  constructor() {
    this.discountService.ensureLoaded();
    this.paramService.ensureLoaded();
  }

  // --- forms de "agregar" ---
  readonly newMinAmount = signal<number>(0);
  readonly newAmountPercent = signal<number>(0);
  readonly amountError = signal<string | null>(null);

  readonly newGroupId = signal<string>('');
  readonly newOptionId = signal<string>('');
  readonly newParamPercent = signal<number>(0);
  readonly paramError = signal<string | null>(null);

  readonly newPagoPercent = signal<number>(0);
  readonly newPagoMethods = signal<Set<PaymentMethod>>(new Set());
  readonly pagoError = signal<string | null>(null);

  readonly newFreeMin = signal<number>(0);
  readonly newFreeDetail = signal<string>('');
  readonly freeError = signal<string | null>(null);

  readonly newStartsAt = signal<string>('');
  readonly newEndsAt = signal<string>('');
  /** "Acumulable" para el descuento que se está por agregar (compartido entre los forms). */
  readonly newStackable = signal<boolean>(false);

  readonly optionsForNewGroup = computed(
    () => this.groups().find((g) => g.id === this.newGroupId())?.options ?? []
  );

  statusLabel(d: Discount): string {
    switch (d.status) {
      case 'PROGRAMADO': return 'Programado';
      case 'VENCIDO': return 'Vencido';
      case 'DESHABILITADO': return 'Deshabilitado';
      default: return 'Activo';
    }
  }

  updateDate(id: string, which: 'startsAt' | 'endsAt', value: string): void {
    this.discountService.update(id, { [which]: value || null });
  }

  toggle(id: string): void {
    this.discountService.toggle(id);
  }

  toggleStackable(id: string): void {
    this.discountService.toggleStackable(id);
  }

  updateDetail(id: string, value: string): void {
    this.discountService.update(id, { detail: value.trim() || null });
  }

  updatePercent(id: string, value: string): void {
    this.discountService.update(id, { discountPercent: clampPct(value) });
  }

  updateMinAmount(id: string, value: string): void {
    this.discountService.update(id, { minAmount: Number(value) || 0 });
  }

  remove(id: string): void {
    if (window.confirm('¿Eliminar este descuento?')) this.discountService.remove(id);
  }

  // --- por monto ---
  addAmountDiscount(): void {
    this.amountError.set(null);
    if (this.newMinAmount() <= 0 || this.newAmountPercent() <= 0) {
      this.amountError.set('Ingresá un monto mínimo y un porcentaje mayores a 0.');
      return;
    }
    this.discountService.add({
      kind: 'MONTO',
      minAmount: this.newMinAmount(),
      discountPercent: clampPct(this.newAmountPercent()),
      enabled: true,
      stackable: this.newStackable(),
      ...this.vigenciaPatch(),
    });
    this.newMinAmount.set(0);
    this.newAmountPercent.set(0);
    this.clearNew();
  }

  // --- por parámetro ---
  groupName(groupId: string | undefined): string {
    return this.groups().find((g) => g.id === groupId)?.name ?? '—';
  }

  optionLabel(groupId: string | undefined, optionId: string | undefined): string {
    if (!groupId || !optionId) return '—';
    return this.paramService.labelFor(groupId, optionId) || '—';
  }

  onNewGroupChange(groupId: string): void {
    this.newGroupId.set(groupId);
    this.newOptionId.set('');
  }

  addParamDiscount(): void {
    this.paramError.set(null);
    if (!this.newGroupId() || !this.newOptionId()) {
      this.paramError.set('Elegí una parametría y una opción.');
      return;
    }
    if (this.newParamPercent() <= 0 || this.newParamPercent() > 100) {
      this.paramError.set('Ingresá un porcentaje entre 1 y 100.');
      return;
    }
    this.discountService.add({
      kind: 'PARAMETRO',
      groupId: this.newGroupId(),
      optionId: this.newOptionId(),
      discountPercent: clampPct(this.newParamPercent()),
      enabled: true,
      stackable: this.newStackable(),
      ...this.vigenciaPatch(),
    });
    this.newGroupId.set('');
    this.newOptionId.set('');
    this.newParamPercent.set(0);
    this.clearNew();
  }

  // --- por medio de pago ---
  isPagoMethodChecked(m: PaymentMethod): boolean {
    return this.newPagoMethods().has(m);
  }

  toggleNewPagoMethod(m: PaymentMethod): void {
    this.newPagoMethods.update((set) => {
      const next = new Set(set);
      next.has(m) ? next.delete(m) : next.add(m);
      return next;
    });
  }

  methodsLabel(d: Discount): string {
    return (d.paymentMethods ?? []).map((m) => this.paymentLabels[m]).join(', ') || '—';
  }

  addPagoDiscount(): void {
    this.pagoError.set(null);
    if (this.newPagoMethods().size === 0) {
      this.pagoError.set('Elegí al menos un medio de pago.');
      return;
    }
    if (this.newPagoPercent() <= 0 || this.newPagoPercent() > 100) {
      this.pagoError.set('Ingresá un porcentaje entre 1 y 100.');
      return;
    }
    this.discountService.add({
      kind: 'PAGO',
      discountPercent: clampPct(this.newPagoPercent()),
      paymentMethods: [...this.newPagoMethods()],
      enabled: true,
      stackable: this.newStackable(),
      ...this.vigenciaPatch(),
    });
    this.newPagoPercent.set(0);
    this.newPagoMethods.set(new Set());
    this.clearNew();
  }

  // --- envío gratis ---
  addFreeShipping(): void {
    this.freeError.set(null);
    if (this.newFreeMin() <= 0) {
      this.freeError.set('Ingresá el monto a partir del cual el envío es gratis.');
      return;
    }
    this.discountService.add({
      kind: 'ENVIO_GRATIS',
      discountPercent: 0,
      minAmount: this.newFreeMin(),
      detail: this.newFreeDetail().trim() || null,
      enabled: true,
      stackable: false,
      ...this.vigenciaPatch(),
    });
    this.newFreeMin.set(0);
    this.newFreeDetail.set('');
    this.clearNew();
  }

  // --- campos compartidos entre los forms ---
  private vigenciaPatch(): { startsAt: string | null; endsAt: string | null } {
    return { startsAt: this.newStartsAt() || null, endsAt: this.newEndsAt() || null };
  }

  private clearNew(): void {
    this.newStartsAt.set('');
    this.newEndsAt.set('');
    this.newStackable.set(false);
  }
}

function clampPct(value: number | string): number {
  return Math.min(100, Math.max(0, Number(value) || 0));
}
