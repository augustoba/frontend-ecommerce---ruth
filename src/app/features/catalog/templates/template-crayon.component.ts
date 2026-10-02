import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogView } from '../catalog-view';
import { Product } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Crayón": la home como una hoja de cuaderno dibujada por un chico.
 * Papel crema, bordes tembleques, cintas adhesivas, colores planos de crayón y
 * letra de mano (Patrick Hand para títulos, Comfortaa para el texto).
 *
 * SU movimiento —el que no comparte con ningún otro diseño— es el dibujo:
 * los garabatos SVG se trazan solos, trazo a trazo, cuando entran en pantalla.
 * Lo hace el CSS de `.crayon-draw` (`stroke-dasharray: 1` + `@keyframes draw-in`)
 * y funciona porque CADA forma del SVG lleva `pathLength="1"`: así el guion
 * normalizado cubre todo el contorno, sin importar el largo real del trazo. Las
 * formas no llevan `fill`, `stroke` ni `stroke-width`: eso lo pone el CSS, que es
 * el único lugar donde vive el look de crayón. Además las cosas tiemblan despacio
 * (`.wobble-slow`) y las tarjetas se pegan con cinta (`.crayon-tape`).
 *
 * Componente tonto a propósito: no inyecta servicios ni pide datos, sólo lee el
 * `CatalogView` que arma `CatalogPageComponent` y resuelve helpers de
 * presentación. Los tokens (tipografías y rampa `brand-*` color papel) los pisa
 * `[data-layout="crayon"], .tpl-crayon` en `styles.css`, por eso acá no hay
 * `styleUrl` ni un solo color literal.
 */
@Component({
  selector: 'app-template-crayon',
  imports: [
    RouterLink,
    FormsModule,
    ProductCardComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-crayon.component.html',
  host: {
    // Los tokens van también en el host (no sólo en `html[data-layout]`) para que
    // la miniatura viva de /admin/config/diseno se vea con la letra de mano y el
    // papel crema aunque el diseño activo de la tienda sea otro. Sin `styleUrl`:
    // el CSS propio vive en `styles.css` por el presupuesto de `anyComponentStyle`.
    class: 'tpl-crayon block bg-brand-50 text-stone-800',
  },
})
export class TemplateCrayonComponent {
  readonly vm = input.required<CatalogView>();

  /**
   * Cómo se compra hoy. Son los dos caminos REALES de la tienda y son
   * excluyentes (lo decide el backend con `mercadoPagoAvailable`): no es una
   * promesa de marketing ni un lugar para inventar envíos o cuotas.
   */
  readonly compraLine = computed(() =>
    this.vm().settings().mercadoPagoAvailable
      ? 'Sumás las prendas al carrito y pagás online con Mercado Pago.'
      : 'Sumás las prendas al carrito y coordinamos la compra por WhatsApp.'
  );

  /**
   * Las prendas del carril "Lo que más sale": las más vendidas de verdad
   * (`bestSellers`) y, si el backend todavía no tiene ventas para armar el
   * ranking, las primeras del catálogo visible. Nunca una lista inventada: en el
   * peor caso son las mismas prendas que ya se ven en la grilla.
   */
  readonly carrilDestaque = computed<Product[]>(() => {
    const masVendidas = this.vm().bestSellers();
    return masVendidas.length ? masVendidas : this.vm().visibleProducts().slice(0, 6);
  });

  /**
   * Si el carril es un ranking real o el fallback. La plantilla lo usa para no
   * afirmar "lo que más sale" cuando en realidad no hay ventas registradas.
   */
  readonly carrilEsRanking = computed<boolean>(() => this.vm().bestSellers().length > 0);

  /**
   * Chip de filtro "Público" con el borde tembleque a mano. No usa `.crayon-chip`
   * porque esa clase vive fuera de las capas de Tailwind y le ganaría en cascada
   * al color del estado activo; por eso el estilo se arma entero acá y el
   * template sólo elige entre los dos estados. Nada de barras `/` en los
   * bindings de clase: rompen el parser con `NG5002`.
   */
  protected publicoChipClass(active: boolean): string {
    const base =
      'inline-flex items-center rounded-[14px_4px_16px_6px] border-2 border-stone-800 px-3.5 py-1.5 font-display text-sm transition-colors';
    return active
      ? `${base} bg-brand-300 text-stone-800`
      : `${base} bg-white text-stone-600 hover:bg-brand-100`;
  }
}
