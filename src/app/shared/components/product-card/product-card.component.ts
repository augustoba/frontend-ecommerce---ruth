import { Component, computed, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product, totalStock } from '../../../core/models/product.model';
import { ParamService } from '../../../core/services/param.service';
import { CldImagePipe } from '../../pipes/cld-image.pipe';

/**
 * Cómo se ve la tarjeta según el diseño de la tienda. No son sólo colores:
 * `editorial` no tiene marco ni sombra (foto + epígrafe con filete) y `pop` es
 * neo-brutalista (borde grueso, sombra dura desplazada, sticker rotado),
 * `vidriera` es una tarjeta cálida con borde que se despega al pasar el mouse,
 * `oferta` es de góndola (sin radio, precio enorme, nombre en mayúscula) y
 * `mosaico` llena la pieza que le toque del tablero (`h-full`: la foto se
 * estira a lo alto que tenga la celda), `nova` es la tarjeta moderna (esquinas
 * muy redondeadas, sombra larga, se levanta al pasar el mouse) y `neon` es la
 * del diseño oscuro: superficie casi negra, anillo cian y brillo al pasar.
 * Las de la tanda para chicos son `caramelo` (pastel y se aplasta como un
 * caramelo), `cohete` (noche espacial), `jungla` (borde de hoja y se balancea)
 * y `crayon` (borde tembleque dibujado a mano).
 *
 * La tanda nueva mantiene la misma lógica: `boutique` sin marco y en serif,
 * `feria` como cartel de cartón con sombra dura, `periodico` como recorte de
 * diario, `retro` como calcomanía Memphis, `suizo` como celda desnuda (la foto
 * se dora al pasar el mouse), `cancha` como ficha con borde de club, `cine`
 * como entrada sobre terciopelo oscuro y `playa` como foto con marco blanco.
 */
export type ProductCardVariant =
  | 'classic'
  | 'editorial'
  | 'pop'
  | 'vidriera'
  | 'oferta'
  | 'mosaico'
  | 'nova'
  | 'neon'
  | 'caramelo'
  | 'cohete'
  | 'jungla'
  | 'crayon'
  | 'boutique'
  | 'feria'
  | 'periodico'
  | 'retro'
  | 'suizo'
  | 'cancha'
  | 'cine'
  | 'playa';

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
  vidriera: {
    root: 'group flex flex-col overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-[0_2px_10px_-6px_rgba(120,80,20,.4)] transition-transform duration-200 hover:-translate-y-1',
    media: 'relative aspect-[4/5] overflow-hidden bg-brand-100',
    img: 'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105',
    badge: 'absolute top-3 left-3 rounded-full bg-brand-400 px-2.5 py-1 text-[11px] font-semibold text-white',
    body: 'flex flex-1 flex-col gap-1 p-4',
    name: 'font-display text-base font-semibold leading-snug text-stone-800 line-clamp-2',
    age: 'text-xs text-stone-500',
    price: 'mt-auto pt-2 font-display text-lg font-bold text-brand-700',
  },
  oferta: {
    root: 'group flex h-full flex-col overflow-hidden border border-stone-200 bg-white transition-shadow duration-200 hover:shadow-[0_14px_28px_-16px_rgba(0,0,0,.45)]',
    media: 'relative aspect-square overflow-hidden bg-stone-50',
    img: 'h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]',
    badge: 'absolute top-0 left-0 bg-stone-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white',
    body: 'flex flex-1 flex-col gap-1 p-3',
    name: 'text-[13px] font-semibold uppercase leading-tight text-stone-800 line-clamp-2',
    age: 'text-[11px] uppercase tracking-wide text-stone-400',
    price: 'mt-auto pt-2 font-display text-2xl font-extrabold leading-none text-brand-600 tabular-nums',
  },
  mosaico: {
    root: 'group flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-stone-900/5 transition-shadow duration-300 hover:shadow-xl',
    media: 'relative min-h-0 flex-1 overflow-hidden bg-stone-100',
    img: 'h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]',
    badge: 'absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-stone-700 backdrop-blur',
    body: 'flex shrink-0 flex-col gap-0.5 p-4',
    name: 'font-display text-sm font-semibold leading-snug text-stone-900 line-clamp-2',
    age: 'text-[11px] text-stone-400',
    price: 'mt-1 text-base font-bold text-brand-600 tabular-nums',
  },
  nova: {
    root: 'group relative flex h-full flex-col overflow-hidden rounded-[26px] bg-white ring-1 ring-black/5 shadow-[0_26px_60px_-42px_rgba(12,10,25,.6)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_36px_70px_-40px_rgba(12,10,25,.5)]',
    media: 'relative aspect-[4/5] overflow-hidden bg-brand-100',
    img: 'h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]',
    badge: 'absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-700 backdrop-blur',
    body: 'flex flex-1 flex-col gap-1 p-4',
    name: 'font-display text-[15px] font-semibold leading-snug text-stone-900 line-clamp-2',
    age: 'text-[11px] uppercase tracking-[0.16em] text-stone-400',
    price: 'mt-auto pt-2 font-display text-lg font-bold text-brand-600 tabular-nums',
  },
  // Ojo: usa las variables `brand-*`, así que sólo se ve como corresponde dentro
  // del diseño Neón (superficie oscura + anillo cian). Ningún otro diseño la usa.
  neon: {
    root: 'group relative flex h-full flex-col overflow-hidden rounded-xl bg-brand-100 ring-1 ring-brand-300 transition-all duration-300 hover:ring-brand-400 hover:shadow-[0_0_30px_-8px_rgba(34,211,238,.75)]',
    media: 'relative aspect-[4/5] overflow-hidden bg-brand-200',
    img: 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
    badge: 'absolute left-2 top-2 rounded bg-black/65 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-400 backdrop-blur',
    body: 'flex flex-1 flex-col gap-1 p-3',
    name: 'font-display text-[13px] font-semibold uppercase leading-snug tracking-wide text-white line-clamp-2',
    age: 'text-[10px] uppercase tracking-[0.2em] text-zinc-400',
    price: 'mt-auto pt-2 font-display text-lg font-bold text-brand-400 tabular-nums',
  },
  // --- Tanda para chicos: cada variante usa los tokens de su diseño ---
  caramelo: {
    root: 'group flex h-full flex-col overflow-hidden rounded-[30px] bg-white shadow-[0_16px_34px_-20px_rgba(18,127,104,.55)] ring-2 ring-brand-100 hover:animate-[jelly_.6s_ease]',
    media: 'relative aspect-[4/5] overflow-hidden bg-brand-100',
    img: 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
    badge: 'absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-brand-600 shadow-sm',
    body: 'flex flex-1 flex-col gap-1 p-4',
    name: 'font-display text-base font-bold leading-snug text-stone-800 line-clamp-2',
    age: 'text-xs text-stone-500',
    price: 'mt-auto pt-2 font-display text-xl font-extrabold text-brand-600 tabular-nums',
  },
  cohete: {
    root: 'group relative flex h-full flex-col overflow-hidden rounded-2xl bg-brand-100 ring-1 ring-white/15 transition-all duration-300 hover:ring-brand-400 hover:shadow-[0_0_34px_-10px_rgba(165,180,252,.9)]',
    media: 'relative aspect-square overflow-hidden bg-brand-50',
    img: 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]',
    badge: 'absolute left-2 top-2 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur',
    body: 'flex flex-1 flex-col gap-1 p-4',
    name: 'font-display text-[15px] leading-snug text-white line-clamp-2',
    age: 'text-[11px] uppercase tracking-[0.18em] text-brand-300',
    price: 'mt-auto pt-3 font-display text-lg text-brand-400 tabular-nums',
  },
  jungla: {
    root: 'group relative flex h-full flex-col overflow-hidden rounded-[30px_10px_30px_10px] bg-white ring-2 ring-brand-300 hover:animate-[sway_1.1s_ease-in-out_infinite]',
    media: 'relative aspect-[4/5] overflow-hidden bg-brand-100',
    img: 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]',
    badge: 'absolute left-3 top-3 rounded-full bg-brand-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white',
    body: 'flex flex-1 flex-col gap-1 p-4',
    name: 'font-display text-lg leading-tight text-brand-800 line-clamp-2',
    age: 'text-xs text-stone-500',
    price: 'mt-auto pt-2 font-display text-xl text-brand-700 tabular-nums',
  },
  crayon: {
    root: 'crayon-border group relative flex h-full flex-col overflow-hidden transition-transform duration-200 hover:-rotate-1',
    media: 'relative aspect-[4/5] overflow-hidden bg-brand-100',
    img: 'h-full w-full object-cover',
    badge: 'absolute left-3 top-3 bg-white px-2 py-1 font-display text-[11px] text-brand-700',
    body: 'flex flex-1 flex-col gap-1 p-4',
    name: 'font-display text-lg leading-tight text-stone-800 line-clamp-2',
    age: 'text-xs text-stone-500',
    price: 'mt-auto pt-2 font-display text-2xl text-brand-600 tabular-nums',
  },
  // --- Tanda nueva: 8 diseños de la segunda ronda ---
  boutique: {
    root: 'group flex flex-col',
    media: 'relative aspect-[3/4] overflow-hidden bg-stone-100',
    img: 'h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]',
    badge: 'absolute left-1/2 top-3 -translate-x-1/2 bg-white/85 px-3 py-1 text-[9px] uppercase tracking-[0.28em] text-stone-500',
    body: 'flex flex-1 flex-col items-center gap-1 pt-4 text-center',
    name: 'font-display text-lg font-medium leading-snug text-stone-900 line-clamp-2',
    age: 'text-[10px] uppercase tracking-[0.24em] text-stone-400',
    price: 'mt-auto pt-2 text-[15px] font-medium text-brand-600 tabular-nums',
  },
  feria: {
    root: 'group flex h-full flex-col overflow-hidden rounded-lg border-2 border-brand-700 bg-[#fffdf8] shadow-[4px_5px_0_0_rgba(124,52,16,.28)] transition-transform duration-200 hover:-translate-y-1',
    media: 'relative aspect-square overflow-hidden border-b-2 border-brand-700 bg-brand-100',
    img: 'h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]',
    badge: 'absolute left-2 top-2 -rotate-2 bg-brand-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#fff8ef]',
    body: 'flex flex-1 flex-col gap-1 p-3',
    name: 'font-display text-[15px] leading-snug text-brand-800 line-clamp-2',
    age: 'text-[11px] font-semibold uppercase tracking-wide text-brand-600',
    price: 'mt-auto pt-2 self-start bg-brand-500 px-2 py-1 font-display text-sm text-[#fff8ef] tabular-nums',
  },
  periodico: {
    root: 'group flex h-full flex-col border border-brand-800 bg-[#fffdf6] transition-shadow duration-200 hover:shadow-[4px_4px_0_0_rgba(38,34,28,.25)]',
    media: 'relative aspect-[4/5] overflow-hidden border-b border-brand-800 bg-brand-100',
    img: 'h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]',
    badge: 'absolute left-2 top-2 bg-brand-800 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#f7f2e7]',
    body: 'flex flex-1 flex-col gap-1 p-3',
    name: 'font-display text-[15px] font-semibold leading-tight text-brand-800 line-clamp-2',
    age: 'text-[10px] uppercase tracking-[0.16em] text-brand-500',
    price: 'mt-auto pt-2 font-display text-lg text-brand-700 tabular-nums',
  },
  retro: {
    root: 'group flex h-full flex-col overflow-hidden rounded-xl border-2 border-[#1c1917] bg-white shadow-[5px_5px_0_0_#1c1917] transition-transform duration-150 hover:-translate-y-1',
    media: 'relative aspect-square overflow-hidden border-b-2 border-[#1c1917] bg-brand-100',
    img: 'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
    badge: 'absolute left-2 top-2 -rotate-2 border-2 border-[#1c1917] bg-[#fbbf24] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1c1917]',
    body: 'flex flex-1 flex-col gap-1 p-3',
    name: 'font-display text-sm uppercase leading-snug text-[#1c1917] line-clamp-2',
    age: 'text-[11px] font-semibold uppercase tracking-wide text-brand-600',
    price: 'mt-auto pt-2 self-start bg-brand-600 px-2.5 py-1 text-sm font-black text-white tabular-nums',
  },
  suizo: {
    root: 'group flex h-full flex-col',
    media: 'relative aspect-square overflow-hidden bg-stone-100',
    img: 'h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-[1.03] group-hover:grayscale-0',
    badge: 'absolute left-2 top-2 bg-white/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-stone-600',
    body: 'flex flex-1 flex-col gap-0.5 pt-2.5',
    name: 'text-[13px] font-semibold leading-tight text-stone-900 line-clamp-2',
    age: 'swiss-card-meta',
    price: 'swiss-card-price mt-auto pt-1.5',
  },
  cancha: {
    root: 'group flex h-full flex-col overflow-hidden rounded-xl border-2 border-brand-800 bg-white transition-transform duration-200 hover:-translate-y-1',
    media: 'relative aspect-square overflow-hidden border-b-2 border-brand-800 bg-brand-100',
    img: 'h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]',
    badge: 'absolute left-2 top-2 rounded-full bg-brand-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white',
    body: 'flex flex-1 flex-col gap-1 p-3',
    name: 'font-display text-[15px] uppercase leading-snug text-brand-800 line-clamp-2',
    age: 'text-[11px] font-semibold uppercase tracking-wide text-brand-500',
    price: 'mt-auto pt-2 self-start bg-brand-600 px-2.5 py-1 font-display text-sm text-white tabular-nums',
  },
  cine: {
    root: 'group flex h-full flex-col overflow-hidden rounded-lg bg-brand-100 ring-1 ring-brand-500/40 transition-all duration-300 hover:ring-brand-400 hover:shadow-[0_0_26px_-10px_rgba(201,151,63,.65)]',
    media: 'relative aspect-[3/4] overflow-hidden bg-brand-50',
    img: 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
    badge: 'absolute left-2 top-2 rounded-sm bg-black/60 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-brand-300 backdrop-blur',
    body: 'flex flex-1 flex-col gap-1 p-3',
    name: 'font-display text-[15px] uppercase leading-snug tracking-wide text-brand-300 line-clamp-2',
    age: 'text-[10px] uppercase tracking-[0.18em] text-white/45',
    price: 'mt-auto pt-2 font-display text-lg text-brand-400 tabular-nums',
  },
  playa: {
    root: 'group flex h-full flex-col overflow-hidden rounded-2xl bg-white p-2 shadow-[0_14px_30px_-18px_rgba(13,148,136,.55)] ring-1 ring-brand-200 transition-transform duration-200 hover:-translate-y-1',
    media: 'relative aspect-square overflow-hidden rounded-xl bg-brand-100',
    img: 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]',
    badge: 'absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-brand-600',
    body: 'flex flex-1 flex-col gap-1 px-3 pb-2 pt-3',
    name: 'text-[15px] font-semibold leading-snug text-brand-800 line-clamp-2',
    age: 'text-[11px] text-brand-600',
    price: 'mt-auto pt-2 text-base font-bold text-brand-600 tabular-nums',
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
