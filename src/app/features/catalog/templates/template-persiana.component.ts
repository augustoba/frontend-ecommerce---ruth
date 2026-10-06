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
 * Diseño "Persiana": las fotos se descubren en tablillas. Cada foto arranca
 * tapada por seis franjas horizontales que se recogen una atrás de la otra cuando
 * la foto entra en pantalla, como una persiana que se levanta (`appReveal
 * variant="slats"` sólo marca `is-visible`; el movimiento es de `.persiana-slat`,
 * un `scaleY` con retraso escalonado).
 *
 * Las tablillas son decorativas (`aria-hidden`) y no tapan nada si el navegador no
 * anima: con `prefers-reduced-motion` directamente no se dibujan.
 */
@Component({
  selector: 'app-template-persiana',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-persiana.component.html',
  host: { class: 'tpl-persiana block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplatePersianaComponent extends MotionTemplateBase {
  /** Las seis tablillas de cada persiana (el número es su orden de arriba hacia abajo). */
  protected readonly tablillas = [0, 1, 2, 3, 4, 5];
}
