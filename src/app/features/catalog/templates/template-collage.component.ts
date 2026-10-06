import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { DragDirective } from '../../../shared/directives/drag.directive';

/**
 * Diseño "Collage": fotos tiradas sobre la mesa. El hero es una pila de fotos
 * de prendas reales, cada una torcida a su manera y pegada con cinta, que se
 * pueden agarrar y mover con el dedo o el mouse (`appDrag`); la que se agarra
 * pasa arriba de las demás y se queda donde se la suelta.
 *
 * Las fotos de la mesa son para jugar, no para comprar: no son links (un link que
 * se arrastra es un link que se abre sin querer). Las prendas se eligen abajo, en
 * el catálogo, donde las tarjetas sí llevan a la ficha.
 */
@Component({
  selector: 'app-template-collage',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
    DragDirective,
  ],
  templateUrl: './template-collage.component.html',
  host: { class: 'tpl-collage block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateCollageComponent extends MotionTemplateBase {
  /** Las fotos de la mesa: las primeras prendas del catálogo (hasta seis). */
  readonly fotos = computed(() => this.vm().visibleProducts().slice(0, 6));
}
