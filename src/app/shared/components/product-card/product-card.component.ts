import { Component, computed, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product, totalStock } from '../../../core/models/product.model';
import { ParamService } from '../../../core/services/param.service';
import { CldImagePipe } from '../../pipes/cld-image.pipe';

/**
 * Cómo se ve la tarjeta según el diseño de la tienda. No son sólo colores:
 * `editorial` no tiene marco ni sombra (foto + epígrape con filete) y `pop` es
 * neo-brutalista (borde grueso, sombra dura desplazada, sticker rotado).
 */
export type ProductCardVariant = 'classic' | 'editorial' | 'pop';

/**
 * Interfaz y no `Record<string, string>`: con un índice el compilador obliga a
 * escribir `c()['body']` en la plantilla (regla `noPropertyAccessFromIndexSignature`).
 */
interface CardClasses {
  root: string;
  media: string;
  img: string;
  badge: string;
  body: string;
  name: string;
  age: string;
  price: string;
}

const CLASSES: Record<ProductCardVariant, CardClasses> = {
  classic: {
    root: 'group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg ring-1 ring-black/5 transition-shadow',
    media: 'relative aspect-[4/5] overflow-hidden bg-brand-100',
    img: 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300',
    badge: 'absolute top-2 left-2 bg-white/90 text-brand-600 text-xs font-bold px-2 py-1 rounded-full',
    body: 'p-4 flex flex-col gap-1 flex-1',
    name: 'font-semibold text-stone-800 line-clamp-2 leading-snug',
    age: 'text-xs text-stone-500',
    price: 'mt-auto pt-2 font-display font-bold text-lg text-brand-600',
  },
  editorial: {
    root: 'group flex flex-col',
    media: 'relative aspect-[3/4] overflow-hidden bg-stone-100',
    img: 'w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.08]',
    badge: 'absolute top-3 left-3 bg-white/85 text-stone-800 text-[10px] font-semibold uppercase tracking-[0.18em] px-2 py-1',
    body: 'pt-3 flex flex-col gap-1 flex-1 border-t border-stone-200',
    name: 'font-display text-[15px] font-semibold text-stone-900 line-clamp-2 leading-tight group-hover:text-brand-700 transition-colors',
    age: 'text-[11px] uppercase tracking-[0.14em] text-stone-400',
    price: 'mt-auto pt-3 text-sm font-semibold tabular-nums text-stone-900',
  },
  pop: {
    root: 'group flex flex-col bg-white border-[3px] border-stone-900 shadow-[5px_5px_0_0_#1c1917] hover:shadow-[9px_9px_0_0_#1c1917] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150',
    media: 'relative aspect-square overflow-hidden bg-brand-100 border-b-[3px] border-stone-900',
    img: 'w-full h-full object-cover transition-transform duration-200 group-hover:scale-110',
    badge: 'absolute top-2 left-2 -rotate-6 bg-brand-400 text-stone-900 text-[10px] font-black uppercase tracking-wide px-2 py-1 border-2 border-stone-900',
    body: 'p-3 flex flex-col gap-1 flex-1',
    name: 'font-black uppercase text-sm text-stone-900 line-clamp-2 leading-tight tracking-tight',
    age: 'text-[11px] font-bold uppercase text-stone-500',
    price: 'mt-auto pt-2 self-start bg-stone-900 text-brand-300 text-sm font-black px-2 py-1 tabular-nums',
  },
};

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, RouterLink, CldImagePipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  private readonly paramService = inject(ParamService);

  readonly product = input.required<Product>();
  readonly variant = input<ProductCardVariant>('classic');

  protected readonly c = computed(() => CLASSES[this.variant()] ?? CLASSES.classic);

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
