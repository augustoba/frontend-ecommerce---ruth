import { Component, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product, totalStock } from '../../../core/models/product.model';
import { ParamService } from '../../../core/services/param.service';
import { CldImagePipe } from '../../pipes/cld-image.pipe';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, RouterLink, CldImagePipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  private readonly paramService = inject(ParamService);

  readonly product = input.required<Product>();
  /**
   * Variante visual según el layout de la página (ver PLAN_SAAS.md Fase
   * 10) — la tarjeta es el elemento que más se repite en la grilla, así
   * que es donde más se nota la diferencia entre diseños.
   */
  readonly variant = input<'classic' | 'editorial' | 'marketplace'>('classic');

  get cardClasses(): string {
    switch (this.variant()) {
      case 'editorial':
        return 'ring-1 ring-stone-200 hover:ring-stone-400 transition-colors';
      case 'marketplace':
        return 'rounded-lg shadow-sm hover:shadow-md ring-1 ring-black/5 bg-brand-50 transition-shadow';
      default:
        return 'rounded-2xl shadow-sm hover:shadow-lg ring-1 ring-black/5 transition-shadow';
    }
  }

  get imageAspectClass(): string {
    return this.variant() === 'editorial' ? 'aspect-[3/4]' : this.variant() === 'marketplace' ? 'aspect-square' : 'aspect-[4/5]';
  }

  get nameClasses(): string {
    switch (this.variant()) {
      case 'editorial':
        return 'font-display font-medium text-stone-900 tracking-wide line-clamp-1';
      case 'marketplace':
        return 'font-bold text-stone-800 uppercase text-sm tracking-tight line-clamp-1';
      default:
        return 'font-semibold text-stone-800 line-clamp-2';
    }
  }

  /** Etiqueta del "Público" del producto (Bebé / Nena / ...) para el badge */
  get categoryLabel(): string {
    const opt = (this.product().params?.['grp-publico'] ?? [])[0];
    return opt ? this.paramService.labelFor('grp-publico', opt) : '';
  }

  get outOfStock(): boolean {
    return totalStock(this.product()) <= 0;
  }

  /** Aviso "últimas X unidades" cuando el stock total está por debajo del umbral. */
  get lowStockLabel(): string {
    const total = totalStock(this.product());
    const threshold = this.product().lowStockThreshold ?? 3;
    if (total <= 0 || total > threshold) return '';
    return total === 1 ? '¡Última unidad!' : `Quedan ${total}`;
  }
}
