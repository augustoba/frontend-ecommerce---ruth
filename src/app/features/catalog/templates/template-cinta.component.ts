import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Cinta": las prendas pasan solas. La pieza central es una cinta
 * transportadora con las prendas destacadas, que corre sin parar hacia un lado, y
 * debajo otra con las promos (o las categorías) que corre para el otro. Se frenan
 * cuando se acerca el puntero o cuando algo adentro toma el foco, así se puede
 * tocar una prenda sin perseguirla.
 *
 * Cada cinta lleva su contenido dos veces: la animación corre exactamente la
 * mitad, y por eso el empalme no se nota. La segunda copia va `aria-hidden` e
 * `inert` (no se lee ni se enfoca dos veces). Con `prefers-reduced-motion` la
 * cinta se detiene, la copia se esconde y queda un riel que se desliza a mano.
 */
@Component({
  selector: 'app-template-cinta',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-cinta.component.html',
  host: { class: 'tpl-cinta block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateCintaComponent extends MotionTemplateBase {
  /** Textos de la segunda cinta: las promos reales o, si no hay, las categorías reales. */
  readonly rotulos = computed<string[]>(() => {
    const promos = this.vm().promos();
    return promos.length ? promos.map((p) => p.text) : this.categorias().map((o) => o.label);
  });
}
