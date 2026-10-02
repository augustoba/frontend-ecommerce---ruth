import { Component, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogView } from '../catalog-view';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Feria": la tienda como un puesto de mercado de barrio. Papel kraft,
 * toldito rayado arriba, carteles de oferta pegados con cinta y las prendas
 * colgadas con una inclinación mínima, como recién acomodadas a mano.
 *
 * Se diferencia de Caramelo (pastel infantil) y de Pop (brutalista) en el
 * material, no en el ruido: acá todo es papel y madera, sin bordes negros.
 *
 * Componente tonto: recibe el `CatalogView` armado y sólo lo dibuja. La paleta
 * y las fuentes las pisa `[data-layout="feria"], .tpl-feria` en `styles.css`.
 */
@Component({
  selector: 'app-template-feria',
  imports: [
    FormsModule,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-feria.component.html',
  host: {
    class: 'tpl-feria block bg-brand-50 text-stone-800',
  },
})
export class TemplateFeriaComponent {
  readonly vm = input.required<CatalogView>();

  /**
   * Cómo se compra de verdad, según el camino configurado en el local.
   */
  readonly compraLine = computed(() =>
    this.vm().settings().mercadoPagoAvailable
      ? 'Elegís, cargás el carrito y pagás con Mercado Pago.'
      : 'Elegís, cargás el carrito y cerramos por WhatsApp.'
  );
}
