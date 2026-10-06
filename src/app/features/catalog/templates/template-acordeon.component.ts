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
 * Diseño "Acordeón": las categorías son franjas que se abren. Están todas
 * juntas, angostas, y la que se toca o se señala se ensancha y muestra su foto,
 * su nombre y cuántas prendas tiene; las demás se cierran.
 *
 * Lo que se anima es `flex-grow` (no hay equivalente en `transform` para repartir
 * un ancho entre hermanos); es la excepción de un acordeón y va acotada a esa
 * tira. Abrir es con el puntero o el foco; el clic sobre la franja ya abierta
 * filtra por esa categoría.
 */
@Component({
  selector: 'app-template-acordeon',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-acordeon.component.html',
  host: { class: 'tpl-acordeon block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateAcordeonComponent extends MotionTemplateBase {
  /** Franja abierta a mano. `null` = todavía ninguna: se abre la primera. */
  private readonly elegida = signal<string | null>(null);

  /** La franja abierta: la elegida o, de entrada, la primera categoría. */
  readonly abierta = computed(() => this.elegida() ?? this.categorias()[0]?.id ?? null);

  protected abrir(id: string): void {
    this.elegida.set(id);
  }

  /** Primer toque abre la franja; el segundo, ya abierta, filtra por la categoría. */
  protected tocar(id: string): void {
    if (this.abierta() === id) this.elegirCategoria(id);
    else this.elegida.set(id);
  }
}
