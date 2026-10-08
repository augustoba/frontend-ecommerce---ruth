import { Component, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogView } from '../catalog-view';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Retro 90s": estética Memphis. Fondo lavanda, formas geométricas
 * que flotan (círculo, triángulo y cuadro, puro CSS), stickers amarillos
 * rotados, un ticker de promos que corre solo y tarjetas con borde grueso de
 * color y sombra dura desplazada.
 *
 * La diferencia con Pop (el otro ruidoso) es el vocabulario: Pop es imprenta
 * brutalista en negro; acá todo es color pastel eléctrico, diagonal y sticker.
 * Y contra Cohete/Neón no comparte nada: esos son de noche, éste es de día.
 *
 * Componente tonto: recibe el `CatalogView` armado y sólo lo dibuja.
 */
@Component({
  selector: 'app-template-retro',
  imports: [
    FormsModule,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-retro.component.html',
  host: {
    class: 'tpl-retro block overflow-x-clip bg-brand-50 text-stone-900',
  },
})
export class TemplateRetroComponent {
  readonly vm = input.required<CatalogView>();

  /** Cómo se compra de verdad, según el camino configurado en el local. */
  readonly compraLine = computed(() =>
    !this.vm().settings().onlineSalesEnabled
      ? 'Mirá las prendas y consultanos por WhatsApp.'
      : this.vm().settings().mercadoPagoAvailable
        ? 'Mandás las prendas al carrito y pagás con Mercado Pago.'
        : 'Mandás las prendas al carrito y coordinamos por WhatsApp.'
  );
}
