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
 * Diseño "Negativo": blanco y negro que se da vuelta. En el hero, un círculo
 * que sigue al puntero invierte todo lo que tiene debajo (`mix-blend-mode:
 * difference`; la posición la escribe `appSpotlight`). Las fotos están en blanco y
 * negro y pasan a negativo al señalarlas, los botones intercambian fondo y texto
 * con un barrido, y la cinta de promos alterna bloques negros y blancos.
 *
 * En táctil el círculo se pasea solo por el hero.
 */
@Component({
  selector: 'app-template-negativo',
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
  templateUrl: './template-negativo.component.html',
  host: { class: 'tpl-negativo block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateNegativoComponent extends MotionTemplateBase {}
