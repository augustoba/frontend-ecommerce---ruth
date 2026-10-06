import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { SpotlightDirective } from '../../../shared/directives/spotlight.directive';

/**
 * Diseño "Tinta": manchas que se expanden. La foto del hero aparece desde una
 * gota que crece, los botones se llenan de tinta desde el punto exacto donde entra
 * el puntero, las fotos de las categorías están en gris y se tiñen de color desde
 * donde se las toca, y cada promo entra tapando a la anterior con un círculo.
 *
 * El origen de cada mancha son `--fx`/`--fy`, que escribe `appSpotlight` en cada
 * botón o foto; lo que crece es un `clip-path: circle()`. En táctil no hay
 * puntero: las fotos se ven en color y los botones se llenan desde el centro.
 */
@Component({
  selector: 'app-template-tinta',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
    SpotlightDirective,
  ],
  templateUrl: './template-tinta.component.html',
  host: { class: 'tpl-tinta block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateTintaComponent extends MotionTemplateBase {}
