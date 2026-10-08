import { Component, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogView, PromoLine } from '../catalog-view';
import { ParamOption } from '../../../core/models/param.model';
import { Product, productHasParam } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Mosaico": un tablero tipo bento. Piezas de distinto tamaño (carrusel,
 * foto del local, "quiénes somos", categorías reales, dos prendas y una pieza
 * lima con la promo vigente) arriba, y el catálogo con filtros abajo.
 *
 * Es el único diseño que saca la foto del local y el "sobre nosotros" del
 * footer, y el único con esquinas muy redondeadas y el acento lima. Las fuentes
 * (Sora + Manrope) y la paleta índigo las pisa `[data-layout="mosaico"],
 * .tpl-mosaico` en `styles.css`, así que también cambian header y footer.
 *
 * Componente tonto a propósito: no inyecta servicios ni pide datos, sólo lee el
 * `CatalogView` que arma `CatalogPageComponent`.
 */
@Component({
  selector: 'app-template-mosaico',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-mosaico.component.html',
  host: {
    // Los tokens del diseño viven acá además de en `html[data-layout]` para que
    // la miniatura viva de /admin/config/diseno se vea con su paleta y sus
    // fuentes aunque el diseño activo sea otro. Sin `styleUrl`: el CSS propio
    // está en `styles.css` por el presupuesto de `anyComponentStyle`.
    class: 'tpl-mosaico block bg-brand-50 text-stone-900 font-sans',
  },
})
export class TemplateMosaicoComponent {
  readonly vm = input.required<CatalogView>();

  /**
   * Cómo se compra hoy. Son los dos caminos REALES de la tienda y son
   * excluyentes (lo decide el backend con `mercadoPagoAvailable`): no es una
   * promesa de marketing, así que no se inventa nada más.
   */
  readonly compraLine = computed(() =>
    !this.vm().settings().onlineSalesEnabled
      ? 'Mirá las prendas y consultanos por WhatsApp.'
      : this.vm().settings().mercadoPagoAvailable
        ? 'Elegí tus prendas, agregalas al carrito y pagá con Mercado Pago.'
        : 'Elegí tus prendas, agregalas al carrito y coordinamos la compra por WhatsApp.'
  );

  /** Las 2 primeras categorías reales del grupo "Público" (Bebé, Nena, Nene…). */
  readonly firstCategories = computed<ParamOption[]>(
    () => this.vm().publicoGroup()?.options.slice(0, 2) ?? []
  );

  /** Prendas de esa categoría, para el contador real de la pieza. */
  protected productsOf(optionId: string): Product[] {
    return this.vm().filteredProducts().filter((p) => productHasParam(p, 'grp-publico', optionId));
  }

  /**
   * La primera promo vigente, o `null`. El tablero tiene una sola pieza de promo
   * (la lima), así que no hace falta la lista entera. Se resuelve acá y no en el
   * template para no tener que indexar el array con un `?.` que el compilador
   * marca como innecesario (el tipo dice que la posición siempre existe).
   */
  readonly firstPromo = computed<PromoLine | null>(() => this.vm().promos()[0] ?? null);

  /** Las 2 prendas del tablero: los más vendidos o, si esa lista viene vacía
   * (pasa en la miniatura de /admin/config/diseno, donde a propósito no hay
   * "más vendidos"), las 2 primeras del catálogo visible.
   *
   * Con filtros puestos se usa el catálogo filtrado: mostrar una prenda que no
   * coincide con lo que el cliente acaba de filtrar sería confuso. Los otros
   * diseños resuelven lo mismo escondiendo "lo más vendido" cuando hay filtros.
   */
  readonly spotlight = computed<Product[]>(() => {
    const v = this.vm();
    const source = v.hasActiveFilters() || !v.bestSellers().length ? v.visibleProducts() : v.bestSellers();
    return source.slice(0, 2);
  });

  /** Cada pieza del tablero ocupa distinto: el carrusel manda, las demás acompañan. */
  protected tileClass(kind: 'carousel' | 'product'): string {
    return kind === 'carousel'
      ? 'col-span-2 row-span-2 lg:col-span-2 lg:row-span-3'
      : 'col-span-1 row-span-2';
  }

  /** Texto de la promo, ya recortado para que entre en la pieza lima. */
  protected clamp(text: string, max = 110): string {
    return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
  }
}
