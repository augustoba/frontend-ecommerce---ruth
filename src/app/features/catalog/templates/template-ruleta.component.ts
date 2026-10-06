import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Ruleta": una rueda de categorías. Las categorías reales van
 * repartidas en círculo; al tocar una (o con las flechas) la rueda gira hasta
 * dejarla arriba, bajo el marcador, y al costado aparece esa categoría en grande
 * con su foto, su conteo y el botón para verla.
 *
 * El giro es una transición sobre `--rot` (se puede cambiar de idea a mitad de
 * giro sin saltos). Cada pieza se contragira lo mismo que gira la rueda, así las
 * fotos quedan siempre derechas. `vueltas` no se reinicia nunca: guarda el giro
 * acumulado, y por eso la rueda siempre toma el camino más corto en vez de
 * rebobinar.
 */
@Component({
  selector: 'app-template-ruleta',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-ruleta.component.html',
  host: { class: 'tpl-ruleta block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateRuletaComponent extends MotionTemplateBase {
  /** Giro acumulado, en pasos (puede ser negativo o mayor que la cantidad de categorías). */
  private readonly vueltas = signal(0);

  /** Grados entre una categoría y la siguiente. */
  readonly paso = computed(() => (this.categorias().length ? 360 / this.categorias().length : 0));

  /** Cuánto está girada la rueda, en grados. */
  readonly rotacion = computed(() => -this.vueltas() * this.paso());

  /** Índice de la categoría que quedó arriba. */
  readonly indice = computed(() => {
    const n = this.categorias().length;
    return n ? ((this.vueltas() % n) + n) % n : 0;
  });

  readonly elegida = computed(() => this.categorias()[this.indice()] ?? null);

  protected girar(pasos: number): void {
    this.vueltas.update((v) => v + pasos);
  }

  /** Gira hasta la categoría `i` por el camino más corto. */
  protected irA(i: number): void {
    const n = this.categorias().length;
    if (!n) return;
    let delta = (((i - this.indice()) % n) + n) % n;
    if (delta > n / 2) delta -= n;
    this.girar(delta);
  }
}
