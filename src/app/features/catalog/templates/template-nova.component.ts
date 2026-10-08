import { Component, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogView } from '../catalog-view';
import { ParamOption } from '../../../core/models/param.model';
import { Product, productHasParam } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { AutoMoreDirective } from '../../../shared/directives/auto-more.directive';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { ScrollProgressDirective } from '../../../shared/directives/scroll-progress.directive';
import { TiltDirective } from '../../../shared/directives/tilt.directive';

/**
 * Diseño "Nova": el más "de ahora". Hero cinematográfico a pantalla completa con
 * la foto del carrusel moviéndose sola (Ken Burns, lo dispara `styles.css`) y un
 * gradiente que se corre por atrás, vidrio sobre la foto, banda kinética, piezas
 * de categoría que se inclinan con el mouse, catálogo que sigue cargando solo al
 * bajar y un cierre oscuro.
 *
 * Es el diseño que más usa las cuatro directivas de movimiento compartidas
 * (`appReveal` con las variantes que estrena acá: `mask`, `blur` y `zoom`,
 * `appTilt`, `appScrollProgress` y `appAutoMore`), así que su gracia está en las
 * transiciones, no en la ornamentación.
 *
 * Componente tonto a propósito: no inyecta servicios ni pide datos, sólo lee el
 * `CatalogView` que arma `CatalogPageComponent` y resuelve helpers de
 * presentación. Los tokens del diseño (Bricolage Grotesque + Plus Jakarta Sans,
 * magenta eléctrico + cian) los pisa `[data-layout="nova"], .tpl-nova` en
 * `styles.css`, por eso acá no hay `styleUrl` ni un solo color literal.
 */
@Component({
  selector: 'app-template-nova',
  imports: [
    FormsModule,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    AutoMoreDirective,
    RevealDirective,
    ScrollProgressDirective,
    TiltDirective,
  ],
  templateUrl: './template-nova.component.html',
  host: {
    // Los tokens van también en el host (no sólo en `html[data-layout]`) para que
    // la miniatura viva de /admin/config/diseno se vea con esta tipografía y esta
    // paleta aunque el diseño activo de la tienda sea otro. Sin `styleUrl`: el CSS
    // propio vive en `styles.css` por el presupuesto de `anyComponentStyle`.
    class: 'tpl-nova block bg-brand-50 text-stone-900',
  },
})
export class TemplateNovaComponent {
  readonly vm = input.required<CatalogView>();

  /**
   * Cómo se compra hoy. Son los dos caminos REALES de la tienda y son
   * excluyentes (lo decide el backend con `mercadoPagoAvailable`): no es una
   * promesa de marketing ni un lugar para inventar envíos o cuotas.
   */
  readonly compraLine = computed(() =>
    !this.vm().settings().onlineSalesEnabled
      ? 'Mirá las prendas y consultanos por WhatsApp.'
      : this.vm().settings().mercadoPagoAvailable
        ? 'Sumás las prendas al carrito y pagás online con Mercado Pago.'
        : 'Sumás las prendas al carrito y coordinamos la compra por WhatsApp.'
  );

  /**
   * Categorías reales del grupo "Público" (Bebé, Nena, Nene…). Si el backend no
   * devolvió parametrías, la lista viene vacía y la sección entera no se dibuja.
   */
  readonly categorias = computed<ParamOption[]>(() => this.vm().publicoGroup()?.options ?? []);

  /**
   * Una foto de verdad para la pieza de esa categoría: la portada de la primera
   * prenda que hoy tiene ese público en el catálogo filtrado. `null` cuando la
   * categoría quedó sin prendas, y ahí la pieza cae al fondo liso de marca.
   */
  readonly fotoDeCategoria = computed<Record<string, string | null>>(() => {
    const fotos: Record<string, string | null> = {};
    for (const option of this.categorias()) {
      fotos[option.id] = this.productsOf(option.id)[0]?.imageUrl ?? null;
    }
    return fotos;
  });

  /**
   * Textos de la banda kinética: las promos vigentes reales (`/api/discounts`) o,
   * si no hay ninguna cargada, los nombres de las categorías reales. Nunca los
   * dos: la banda es una sola franja, sin relleno inventado.
   */
  readonly ticker = computed<string[]>(() => {
    const promos = this.vm().promos();
    return promos.length ? promos.map((p) => p.text) : this.categorias().map((o) => o.label);
  });

  /**
   * El mismo contenido, dos veces. `.anim-marquee` corre exactamente 50%, así que
   * sin la segunda copia se vería el salto al reiniciar el loop. La copia extra
   * se marca `aria-hidden` en el template para que un lector de pantalla no lea
   * la lista duplicada.
   */
  readonly tickerLoop = computed<string[]>(() => [...this.ticker(), ...this.ticker()]);

  /** Prendas de esa categoría, para el contador real de la pieza. */
  protected productsOf(optionId: string): Product[] {
    return this.vm().filteredProducts().filter((p) => productHasParam(p, 'grp-publico', optionId));
  }

  /**
   * Filtrar por esa categoría y bajar hasta la grilla: la pieza sólo promete algo
   * que el contenedor ya sabe hacer, la plantilla no filtra por su cuenta.
   */
  protected elegirCategoria(optionId: string): void {
    const group = this.vm().publicoGroup();
    if (!group) return;
    this.vm().setParam(group.id, optionId);
    this.vm().scrollToCatalog();
  }
}
