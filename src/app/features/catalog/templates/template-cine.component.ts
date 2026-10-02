import { Component, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogView } from '../catalog-view';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Cine": la tienda como un cine de barrio. Terciopelo bordó, marquesina
 * con foquitos que persiguen alrededor del cartel, cortinas en el hero y las
 * prendas presentadas como afiches de película (verticales, con placa).
 *
 * Comparte el fondo oscuro con Neón, pero no el idioma: allá es arcade
 * ciberpunk (cian, grilla, tips); acá es la calidez de una sala (bordó, dorado,
 * foquitos). El único movimiento fuerte es la marquesina.
 *
 * Componente tonto: recibe el `CatalogView` armado y sólo lo dibuja.
 */
@Component({
  selector: 'app-template-cine',
  imports: [
    FormsModule,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-cine.component.html',
  host: {
    class: 'tpl-cine block bg-brand-50 text-stone-100',
  },
})
export class TemplateCineComponent {
  readonly vm = input.required<CatalogView>();

  /** Cómo se compra de verdad, según el camino configurado en el local. */
  readonly compraLine = computed(() =>
    this.vm().settings().mercadoPagoAvailable
      ? 'Elegís las prendas, las sumás al carrito y pagás con Mercado Pago.'
      : 'Elegís las prendas, las sumás al carrito y coordinamos por WhatsApp.'
  );
}
