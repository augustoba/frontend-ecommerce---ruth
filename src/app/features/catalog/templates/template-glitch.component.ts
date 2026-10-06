import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Glitch": la señal está rota. Los títulos llevan dos copias desfasadas
 * en rojo y cian que saltan cada tanto (`::before`/`::after` con `data-text`), las
 * fotos van en tres capas que se separan al señalarlas, y los botones tiemblan y
 * se cortan en franjas. La home es oscura; el resto de la tienda no (como Foco,
 * la rampa oscura vive sólo en `.tpl-glitch`).
 *
 * Los saltos son animaciones con `steps()`: cortos, espaciados y sólo sobre
 * `transform`/`clip-path`. Con `prefers-reduced-motion` no hay ninguno.
 */
@Component({
  selector: 'app-template-glitch',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-glitch.component.html',
  host: { class: 'tpl-glitch block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateGlitchComponent extends MotionTemplateBase {
  /** Las tres capas de cada foto: la normal, la roja y la cian. */
  protected readonly capas = [0, 1, 2];
}
