import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { ConfettiDirective } from '../../../shared/directives/confetti.directive';

/**
 * Diseño "Confeti": una fiesta. Cada botón y cada categoría que se toca suelta
 * una ráfaga de papelitos desde ese punto (`appConfetti`); en el hero caen
 * papelitos todo el tiempo, una guirnalda de banderines se hamaca arriba de las
 * promos, y las tarjetas y las fotos rebotan al entrar y al señalarlas.
 *
 * Los papelitos que caen son doce `<i>` decorativos con una animación CSS cada
 * uno (`transform` solamente); su lugar, tamaño y ritmo salen de `:nth-child`.
 */
@Component({
  selector: 'app-template-confeti',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
    ConfettiDirective,
  ],
  templateUrl: './template-confeti.component.html',
  host: { class: 'tpl-confeti block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateConfetiComponent extends MotionTemplateBase {
  /** Los doce papelitos que caen en el hero y los ocho banderines de la guirnalda. */
  protected readonly papelitos = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  protected readonly banderines = [0, 1, 2, 3, 4, 5, 6, 7];
}
