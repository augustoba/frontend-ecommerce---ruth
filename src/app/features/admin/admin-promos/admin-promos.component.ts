import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PromoService } from '../../../core/services/promo.service';

@Component({
  selector: 'app-admin-promos',
  imports: [FormsModule],
  templateUrl: './admin-promos.component.html',
  styleUrl: './admin-promos.component.css',
})
export class AdminPromosComponent {
  private readonly promoService = inject(PromoService);

  readonly tiers = this.promoService.tiers;

  readonly newMinAmount = signal<number>(0);
  readonly newDiscountPercent = signal<number>(0);
  readonly error = signal<string | null>(null);

  toggle(id: string): void {
    this.promoService.toggle(id);
  }

  updateMinAmount(id: string, value: string): void {
    const minAmount = Number(value) || 0;
    const tier = this.tiers().find((t) => t.id === id);
    if (!tier) return;
    this.promoService.update(id, minAmount, tier.discountPercent);
  }

  updateDiscountPercent(id: string, value: string): void {
    const discountPercent = Math.min(100, Math.max(0, Number(value) || 0));
    const tier = this.tiers().find((t) => t.id === id);
    if (!tier) return;
    this.promoService.update(id, tier.minAmount, discountPercent);
  }

  remove(id: string): void {
    const confirmed = window.confirm('¿Eliminar este descuento?');
    if (confirmed) this.promoService.remove(id);
  }

  addTier(): void {
    this.error.set(null);
    if (this.newMinAmount() <= 0 || this.newDiscountPercent() <= 0) {
      this.error.set('Ingresá un monto mínimo y un porcentaje de descuento mayores a 0.');
      return;
    }
    if (this.newDiscountPercent() > 100) {
      this.error.set('El descuento no puede ser mayor a 100%.');
      return;
    }
    this.promoService.add(this.newMinAmount(), this.newDiscountPercent());
    this.newMinAmount.set(0);
    this.newDiscountPercent.set(0);
  }
}
