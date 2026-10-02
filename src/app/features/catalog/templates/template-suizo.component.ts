import { Component, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogView } from '../catalog-view';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Suizo": estilo tipográfico internacional. Blanco, negro y un solo
 * rojo de acento; una familia (Archivo) en todos sus pesos y Space Mono para
 * los datos; secciones numeradas (01, 02, 03), etiquetas en versalita, la
 * grilla visible como línea de un píxel y fotos en blanco y negro que
 * recuperan el color al pasar el mouse.
 *
 * Es el único diseño sin una sola forma decorativa: todo es retícula, tipo y
 * reglas. Cero sombras, cero radios.
 *
 * Componente tonto: recibe el `CatalogView` armado y sólo lo dibuja.
 */
@Component({
  selector: 'app-template-suizo',
  imports: [
    FormsModule,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-suizo.component.html',
  host: {
    class: 'tpl-suizo block bg-white text-stone-900',
  },
})
export class TemplateSuizoComponent {
  readonly vm = input.required<CatalogView>();

  /** Cómo se compra de verdad, según el camino configurado en el local. */
  readonly compraLine = computed(() =>
    this.vm().settings().mercadoPagoAvailable
      ? 'Compra online, con pago por Mercado Pago.'
      : 'Compra online, con coordinación por WhatsApp.'
  );
}
