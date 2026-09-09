import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CouponService } from '../../../core/services/coupon.service';
import { ToastService } from '../../../core/services/toast.service';
import { CouponInput, CouponKind } from '../../../core/models/coupon.model';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-admin-coupons',
  imports: [CurrencyPipe, DatePipe, FormsModule, SkeletonComponent],
  templateUrl: './admin-coupons.component.html',
})
export class AdminCouponsComponent {
  private readonly couponService = inject(CouponService);
  private readonly toast = inject(ToastService);

  readonly coupons = this.couponService.coupons;
  readonly status = this.couponService.status;
  readonly saving = this.couponService.saving;
  readonly reload = () => this.couponService.reload();

  constructor() {
    this.couponService.ensureLoaded();
  }

  // --- Alta ---
  readonly showForm = signal(false);
  readonly kind = signal<CouponKind>('PERCENT');
  readonly value = signal<number | null>(null);
  readonly minAmount = signal<number | null>(null);
  readonly singleUse = signal(true);
  readonly maxUses = signal<number | null>(null);
  readonly expiresAt = signal('');
  readonly stackable = signal(true);
  readonly label = signal('');
  readonly generateMany = signal(false);
  readonly count = signal<number | null>(null);
  readonly codePrefix = signal('');
  readonly explicitCode = signal('');
  readonly formError = signal<string | null>(null);

  toggleForm(): void {
    this.showForm.update((v) => !v);
  }

  create(): void {
    this.formError.set(null);
    const value = Number(this.value());
    if (!value || value <= 0) {
      this.formError.set('Poné el descuento del cupón.');
      return;
    }
    if (this.kind() === 'PERCENT' && value > 100) {
      this.formError.set('El porcentaje no puede ser mayor a 100.');
      return;
    }
    const many = this.generateMany() && (this.count() ?? 0) > 1;
    const input: CouponInput = {
      kind: this.kind(),
      value,
      minAmount: this.minAmount() || null,
      maxUses: this.singleUse() ? 1 : this.maxUses() || null,
      expiresAt: this.expiresAt() || null,
      stackable: this.stackable(),
      label: this.label().trim() || null,
      ...(many
        ? { count: this.count()!, codePrefix: this.codePrefix().trim() || undefined }
        : { code: this.explicitCode().trim() || undefined }),
    };
    this.couponService.create(input, () => {
      this.toast.success(many ? `${this.count()} cupones generados.` : 'Cupón creado.');
      this.resetForm();
    });
  }

  private resetForm(): void {
    this.showForm.set(false);
    this.value.set(null);
    this.minAmount.set(null);
    this.maxUses.set(null);
    this.expiresAt.set('');
    this.label.set('');
    this.count.set(null);
    this.codePrefix.set('');
    this.explicitCode.set('');
    this.generateMany.set(false);
    this.singleUse.set(true);
  }

  toggleEnabled(id: string, enabled: boolean): void {
    this.couponService.setEnabled(id, !enabled);
  }

  remove(id: string, code: string): void {
    if (window.confirm(`¿Borrar el cupón ${code}? Esta acción no se puede deshacer.`)) {
      this.couponService.delete(id);
    }
  }

  async copy(code: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      this.toast.success(`Código ${code} copiado.`);
    } catch {
      this.toast.error('No se pudo copiar.');
    }
  }

  usesLabel = (used: number, max: number | null | undefined): string =>
    max == null ? `${used} usos` : `${used} / ${max}`;
}
