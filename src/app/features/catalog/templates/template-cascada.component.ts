import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { Product } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { ScrollSceneDirective } from '../../../shared/directives/scroll-scene.directive';

/**
 * Diseño "Cascada": profundidad. Las prendas destacadas van en tres columnas
 * que se mueven a distinta velocidad mientras se baja (parallax): la del medio
 * sube, las de los costados bajan, y la pared entera parece tener relieve. La
 * foto del hero también se corre más lento que la página.
 *
 * Cada columna lleva su propio `appScrollScene="view"` midiendo la pared
 * (`sceneOf=".cascada-wall"`); el corrimiento sale de `--s` y de `--drift`, que
 * es cuánto se mueve esa columna. Con `prefers-reduced-motion` no se escribe
 * `--s` y las columnas quedan quietas y alineadas.
 */
@Component({
  selector: 'app-template-cascada',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
    ScrollSceneDirective,
  ],
  templateUrl: './template-cascada.component.html',
  host: { class: 'tpl-cascada block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateCascadaComponent extends MotionTemplateBase {
  /** Las destacadas repartidas en tres columnas, una prenda para cada una por vuelta. */
  readonly columnas = computed<Product[][]>(() => {
    const cols: Product[][] = [[], [], []];
    this.destacadas().items.forEach((p, i) => cols[i % 3].push(p));
    return cols.filter((c) => c.length);
  });
}
