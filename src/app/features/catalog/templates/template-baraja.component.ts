import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { SwipeDirective } from '../../../shared/directives/swipe.directive';

/**
 * Diseño "Baraja": la tienda como un mazo. Lo más vendido es una pila de cartas
 * que se pasa arrastrando (o con los botones), las categorías se abren en
 * abanico y cada sección tapa a la anterior al bajar, como cartas que se apilan.
 *
 * El mazo no mueve nada por JS: `top` dice qué carta está arriba, cada carta
 * recibe su lugar en la pila (`--pos`) y la transición de `.baraja-card` la
 * acomoda. El arrastre es de `appSwipe`.
 */
@Component({
  selector: 'app-template-baraja',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
    SwipeDirective,
  ],
  templateUrl: './template-baraja.component.html',
  host: { class: 'tpl-baraja block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateBarajaComponent extends MotionTemplateBase {
  /** Cuántas cartas se pasaron. Crece o baja sin tope; el lugar sale con módulo. */
  private readonly top = signal(0);

  /** Las cartas del mazo: lo más vendido o, con pocas ventas, las novedades. */
  readonly mazo = computed(() => this.destacadas().items);

  /** Cuál es la carta de arriba (1..n), para el contador. */
  readonly cartaActual = computed(() => {
    const n = this.mazo().length;
    return n ? (((this.top() % n) + n) % n) + 1 : 0;
  });

  /** Lugar de la carta `i` en la pila: 0 = arriba de todo. */
  protected posOf(i: number): number {
    const n = this.mazo().length;
    return n ? (((i - this.top()) % n) + n) % n : 0;
  }

  protected pasar(): void {
    this.top.update((t) => t + 1);
  }

  protected volver(): void {
    this.top.update((t) => t - 1);
  }
}
