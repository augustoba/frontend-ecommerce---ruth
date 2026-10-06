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
 * Diseño "Fragmento": todo se arma con pedazos. Cada foto son cuatro triángulos
 * de la misma imagen (cuatro copias recortadas con `clip-path`, una por cuadrante
 * en diagonal) que llegan volando desde afuera, cada uno desde su lado, y encajan;
 * al señalarla se vuelven a separar apenas, como un vidrio rajado. Los botones se
 * parten en dos mitades en diagonal y el fondo de las promos son facetas.
 *
 * `appReveal variant="slats"` sólo marca cuándo armar la foto; el viaje de cada
 * pedazo sale de su `--i`.
 */
@Component({
  selector: 'app-template-fragmento',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-fragmento.component.html',
  host: { class: 'tpl-fragmento block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateFragmentoComponent extends MotionTemplateBase {
  /** Los cuatro pedazos de cada foto: arriba, derecha, abajo e izquierda. */
  protected readonly pedazos = [0, 1, 2, 3];
}
