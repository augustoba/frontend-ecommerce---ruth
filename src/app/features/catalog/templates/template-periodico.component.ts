import { Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogView } from '../catalog-view';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Periódico": la home como la portada de un diario. Cabecera en
 * gótica, fecha real de hoy, "ÚLTIMO MOMENTO" para las promos, "LO MÁS
 * LEÍDO" como la lista de notas más leídas (con foto chica y número grande)
 * y el catálogo bajo el rótulo "Clasificados".
 *
 * Se diferencia de Editorial en el material: allá es una revista de moda
 * (blanco, aire, Playfair); acá es papel prensa (fondo hueso grisáceo,
 * filetes dobles, Old Standard y Franklin).
 *
 * Componente tonto: recibe el `CatalogView` armado y sólo lo dibuja.
 */
@Component({
  selector: 'app-template-periodico',
  imports: [
    CurrencyPipe,
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-periodico.component.html',
  host: {
    class: 'tpl-periodico block bg-brand-50 text-stone-900',
  },
})
export class TemplatePeriodicoComponent {
  readonly vm = input.required<CatalogView>();

  /**
   * La fecha de la "edición": la de hoy, formateada como en un diario. Se
   * calcula una sola vez al construir el componente (la portada de un diario
   * no cambia de fecha mientras la leés).
   */
  readonly fecha = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  /** Cómo se compra de verdad, según el camino configurado en el local. */
  readonly compraLine = computed(() =>
    !this.vm().settings().onlineSalesEnabled
      ? 'Mirá las prendas y consultanos por WhatsApp.'
      : this.vm().settings().mercadoPagoAvailable
        ? 'La compra se hace online y se paga con Mercado Pago.'
        : 'La compra se hace online y se coordina por WhatsApp.'
  );
}
