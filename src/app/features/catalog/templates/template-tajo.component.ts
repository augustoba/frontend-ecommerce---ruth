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
 * Diseño "Tajo": todo está cortado. La foto del hero son cinco tiras verticales
 * de la misma imagen (cinco copias, cada una recortada con `clip-path` según su
 * `--i`) que llegan desfasadas y encajan; las de las categorías son tres tiras
 * que se vuelven a desfasar al señalarlas. Los botones se llenan con un tajo en
 * diagonal y las promos entran de costado, una de cada lado.
 *
 * `--n` es la cantidad de tiras del contenedor: de ahí sale el ancho de cada
 * corte, así el mismo CSS sirve para cinco tiras o para tres.
 */
@Component({
  selector: 'app-template-tajo',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-tajo.component.html',
  host: { class: 'tpl-tajo block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateTajoComponent extends MotionTemplateBase {
  /** Las cinco tiras de la foto del hero. */
  protected readonly tiras = [0, 1, 2, 3, 4];
  /** Las tres tiras de cada foto de categoría. */
  protected readonly cortes = [0, 1, 2];
}
