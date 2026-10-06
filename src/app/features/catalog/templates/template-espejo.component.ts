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
 * Diseño "Espejo": dos columnas que se cruzan. Es una escena clavada (como
 * Pasarela, pero en vertical): mientras se baja, la columna de la izquierda sube
 * y la de la derecha baja, las dos a la vez, con el título fijo en el medio.
 *
 * Las dos columnas reciben el mismo `--s` de `appScrollScene` y lo usan al revés
 * una de la otra. Cada una corre exactamente lo que le sobra de alto respecto de
 * su ventana (`--win`), así las dos terminan justo en su última prenda. Con
 * `prefers-reduced-motion` la escena se desarma y quedan dos columnas quietas.
 */
@Component({
  selector: 'app-template-espejo',
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
  templateUrl: './template-espejo.component.html',
  host: { class: 'tpl-espejo block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateEspejoComponent extends MotionTemplateBase {
  /** Las destacadas, partidas en dos: pares a la izquierda, impares a la derecha. */
  readonly mitades = computed<[Product[], Product[]]>(() => {
    const a: Product[] = [];
    const b: Product[] = [];
    this.destacadas().items.forEach((p, i) => (i % 2 ? b : a).push(p));
    return [a, b];
  });
}
