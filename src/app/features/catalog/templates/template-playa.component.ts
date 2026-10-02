import { Component, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogView } from '../catalog-view';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Playa": la tienda como un día de mar. Turquesa y coral, el nombre en
 * tipografía script, olas SVG que separan las secciones y sombras suaves como
 * sal. El carrusel va enmarcado como una foto de vacaciones.
 */
@Component({
  selector: 'app-template-playa',
  imports: [FormsModule, ProductCardComponent, HeroCarouselComponent, SkeletonComponent, CldImagePipe, RevealDirective],
  templateUrl: './template-playa.component.html',
  host: { class: 'tpl-playa block bg-brand-50 text-stone-800' },
})
export class TemplatePlayaComponent {
  readonly vm = input.required<CatalogView>();

  /** Línea de compra: el camino real configurado en /api/settings. */
  readonly compraLine = computed(() =>
    this.vm().settings().mercadoPagoAvailable
      ? 'Elegís las prendas, las sumás al carrito y pagás con Mercado Pago.'
      : 'Elegís las prendas, las sumás al carrito y las coordinamos por WhatsApp.'
  );
}
