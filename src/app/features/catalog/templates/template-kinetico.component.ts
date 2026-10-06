import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { ScrollSceneDirective } from '../../../shared/directives/scroll-scene.directive';

/**
 * Diseño "Kinético": la tipografía es la que se mueve. El nombre de la tienda se
 * arma letra por letra y, al bajar, las letras se afinan y se angostan (es una
 * fuente variable: `appScrollScene` escribe `--s` y `.kinetico-title` lo usa en
 * `font-variation-settings`). Más abajo, una palabra gigante deja ver una foto
 * real por dentro de las letras y dos cintas de texto corren en sentidos opuestos.
 *
 * Cada palabra del título va en su propio renglón y sin cortes: así, aunque las
 * letras cambien de ancho con el scroll, la cantidad de renglones no cambia y la
 * página no salta.
 */
@Component({
  selector: 'app-template-kinetico',
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
  templateUrl: './template-kinetico.component.html',
  host: { class: 'tpl-kinetico block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateKineticoComponent extends MotionTemplateBase {
  /** El nombre de la tienda, palabra por palabra y letra por letra. */
  readonly palabras = computed(() =>
    this.vm()
      .storeName()
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((palabra) => Array.from(palabra))
  );

  /** La palabra gigante de la sección con foto: la más larga del nombre. */
  readonly palabraGrande = computed(() =>
    this.palabras()
      .map((letras) => letras.join(''))
      .reduce((a, b) => (b.length > a.length ? b : a), '')
  );

  /** Foto real que se ve por dentro de las letras: del carrusel o, si no hay, de una prenda. */
  readonly fotoLetras = computed<string | null>(() => {
    const v = this.vm();
    return v.heroSlides()[0]?.imageUrl ?? v.filteredProducts()[0]?.imageUrl ?? null;
  });

  /** Textos de las cintas: las promos reales o, si no hay, las categorías reales. */
  readonly cinta = computed<string[]>(() => {
    const promos = this.vm().promos();
    return promos.length ? promos.map((p) => p.text) : this.categorias().map((o) => o.label);
  });

  /** Duplicada: `.anim-marquee` corre exactamente 50%. */
  readonly cintaLoop = computed<string[]>(() => [...this.cinta(), ...this.cinta()]);
}
