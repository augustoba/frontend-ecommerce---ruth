import { Component, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogView } from '../catalog-view';
import { Product, productHasParam } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Vidriera": la home como la vidriera de un local a la calle. En vez de
 * una grilla única con filtros, el catálogo se recorre **por categoría real**:
 * un riel que se desliza por cada opción del grupo "Público" (Bebé, Nena, Nene…),
 * después lo más vendido y recién al final el catálogo completo con los filtros.
 *
 * Cálida y redondeada (crema + mostaza): la paleta y las tipografías redondeadas
 * (Fredoka / Karla) las pisa `[data-layout="vidriera"], .tpl-vidriera` en
 * `styles.css`, igual que en Editorial y Pop. Las piezas propias del diseño
 * (`.vid-rail`, `.vid-underline`, `.vid-tag`) viven ahí y no acá, por el
 * presupuesto de CSS por componente: por eso el componente no tiene `styleUrl`.
 *
 * Como toda plantilla, es un componente **tonto**: recibe el `CatalogView` ya
 * armado y sólo lo dibuja. No pide datos ni conoce servicios.
 */
@Component({
  selector: 'app-template-vidriera',
  imports: [
    FormsModule,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-vidriera.component.html',
  host: {
    // Las variables del diseño van también en el host (además de en
    // `html[data-layout]`) para que la miniatura viva de /admin/config/diseno se
    // vea con la paleta y las fuentes de Vidriera aunque el diseño activo sea otro.
    class: 'tpl-vidriera block bg-brand-50 text-stone-800',
  },
})
export class TemplateVidrieraComponent {
  readonly vm = input.required<CatalogView>();

  /**
   * La única frase del encabezado: cómo se compra de verdad. Los dos caminos de
   * la tienda son excluyentes y los decide el backend
   * (`site_settings.mercado_pago_available`), así que se elige uno según ese dato
   * en vez de prometer los dos: nada de envíos, cuotas ni promesas que no estén
   * cargadas en el panel.
   */
  readonly compraLine = computed(() =>
    this.vm().settings().mercadoPagoAvailable
      ? 'Elegís las prendas, las agregás al carrito y pagás con Mercado Pago.'
      : 'Elegís las prendas, las agregás al carrito y coordinamos la compra por WhatsApp.'
  );

  /**
   * Prendas de una categoría del grupo "Público", para armar cada riel.
   *
   * Se filtra sobre `filteredProducts()` (y no sobre el catálogo crudo) para que
   * los rieles acompañen a los filtros: si buscás "buzo", cada categoría muestra
   * sólo sus buzos; si una categoría se queda sin prendas, su sección se saltea.
   *
   * El grupo es fijo (`grp-publico`) porque es un grupo de sistema: el id está
   * también en `ProductCardComponent.categoryLabel` y en el catálogo.
   */
  protected productsOf(optionId: string): Product[] {
    return this.vm()
      .filteredProducts()
      .filter((product) => productHasParam(product, 'grp-publico', optionId));
  }
}
