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
 * Diseño "Eco": todo deja copias. El nombre de la tienda lleva tres copias en
 * contorno detrás, que al cargar se abren en abanico hacia un costado; los títulos
 * de sección tienen su eco (`::before`/`::after` con `data-text`), las fotos y los
 * botones llevan marcos repetidos que se corren al señalarlos, y la cinta de
 * promos pasa en letras huecas.
 *
 * Las copias del título son `<span aria-hidden>` reales (y no sombras de texto)
 * porque así se mueven con `transform`: animar `text-shadow` repinta el texto en
 * cada frame.
 */
@Component({
  selector: 'app-template-eco',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-eco.component.html',
  host: { class: 'tpl-eco block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateEcoComponent extends MotionTemplateBase {
  /** Las tres copias del título. El número es qué tan lejos queda cada una. */
  protected readonly ecos = [1, 2, 3];
}
