import { Component, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogView } from '../catalog-view';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Cancha": la tienda como un club. Verde de campo, tablero negro con
 * números tipo marcador, tarjetas con la franja de camiseta y la sección de
 * destacados jugada "adentro de la cancha" (fondo verde con las líneas del
 * círculo central).
 *
 * No se parece a ningún otro: no hay otro diseño con estética deportiva, y el
 * vocabulario (franjas, marcador, líneas de cal) no lo comparte con nadie.
 *
 * Componente tonto: recibe el `CatalogView` armado y sólo lo dibuja.
 */
@Component({
  selector: 'app-template-cancha',
  imports: [
    FormsModule,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-cancha.component.html',
  host: {
    class: 'tpl-cancha block bg-brand-50 text-stone-800',
  },
})
export class TemplateCanchaComponent {
  readonly vm = input.required<CatalogView>();

  /** Cómo se compra de verdad, según el camino configurado en el local. */
  readonly compraLine = computed(() =>
    !this.vm().settings().onlineSalesEnabled
      ? 'Mirá las prendas y consultanos por WhatsApp.'
      : this.vm().settings().mercadoPagoAvailable
        ? 'Sumás las prendas al carrito y pagás con Mercado Pago.'
        : 'Sumás las prendas al carrito y coordinamos por WhatsApp.'
  );
}
