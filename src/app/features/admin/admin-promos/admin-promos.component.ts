import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiscountService } from '../../../core/services/discount.service';
import { ParamService } from '../../../core/services/param.service';
import { DiscountCombineMode } from '../../../core/models/discount.model';

@Component({
  selector: 'app-admin-promos',
  imports: [FormsModule],
  templateUrl: './admin-promos.component.html',
  styleUrl: './admin-promos.component.css',
})
export class AdminPromosComponent {
  private readonly discountService = inject(DiscountService);
  private readonly paramService = inject(ParamService);

  readonly amountDiscounts = this.discountService.amountDiscounts;
  readonly paramDiscounts = this.discountService.paramDiscounts;
  readonly combineMode = this.discountService.combineMode;
  readonly groups = this.paramService.groups;

  // --- por monto ---
  readonly newMinAmount = signal<number>(0);
  readonly newAmountPercent = signal<number>(0);
  readonly amountError = signal<string | null>(null);

  // --- por parámetro ---
  readonly newGroupId = signal<string>('');
  readonly newOptionId = signal<string>('');
  readonly newParamPercent = signal<number>(0);
  readonly paramError = signal<string | null>(null);

  readonly optionsForNewGroup = computed(
    () => this.groups().find((g) => g.id === this.newGroupId())?.options ?? []
  );

  setCombineMode(mode: DiscountCombineMode): void {
    this.discountService.setCombineMode(mode);
  }

  toggle(id: string): void {
    this.discountService.toggle(id);
  }

  remove(id: string): void {
    if (window.confirm('¿Eliminar este descuento?')) this.discountService.remove(id);
  }

  // --- por monto ---

  updateMinAmount(id: string, value: string): void {
    this.discountService.update(id, { minAmount: Number(value) || 0 });
  }

  updateAmountPercent(id: string, value: string): void {
    this.discountService.update(id, {
      discountPercent: Math.min(100, Math.max(0, Number(value) || 0)),
    });
  }

  addAmountDiscount(): void {
    this.amountError.set(null);
    if (this.newMinAmount() <= 0 || this.newAmountPercent() <= 0) {
      this.amountError.set('Ingresá un monto mínimo y un porcentaje mayores a 0.');
      return;
    }
    if (this.newAmountPercent() > 100) {
      this.amountError.set('El descuento no puede ser mayor a 100%.');
      return;
    }
    this.discountService.add({
      kind: 'monto',
      minAmount: this.newMinAmount(),
      discountPercent: this.newAmountPercent(),
      enabled: true,
    });
    this.newMinAmount.set(0);
    this.newAmountPercent.set(0);
  }

  // --- por parámetro ---

  groupName(groupId: string | undefined): string {
    return this.groups().find((g) => g.id === groupId)?.name ?? '—';
  }

  optionLabel(groupId: string | undefined, optionId: string | undefined): string {
    if (!groupId || !optionId) return '—';
    return this.paramService.labelFor(groupId, optionId) || '—';
  }

  updateParamPercent(id: string, value: string): void {
    this.discountService.update(id, {
      discountPercent: Math.min(100, Math.max(0, Number(value) || 0)),
    });
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
      kind: 'parametro',
      groupId: this.newGroupId(),
      optionId: this.newOptionId(),
      discountPercent: this.newParamPercent(),
      enabled: true,
    });
    this.newGroupId.set('');
    this.newOptionId.set('');
    this.newParamPercent.set(0);
  }
}
