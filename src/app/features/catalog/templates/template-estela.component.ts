import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { CursorTrailDirective } from '../../../shared/directives/cursor-trail.directive';
import { MagneticDirective } from '../../../shared/directives/magnetic.directive';

/**
 * Diseño "Estela": el puntero deja rastro. La pieza central es el índice de
 * categorías en letra enorme: al pasar el mouse por un renglón, la foto real de
 * esa categoría sigue al puntero con tres copias que la persiguen a distinto
 * ritmo (`appCursorTrail`), y los botones principales son "magnéticos"
 * (`appMagnetic`).
 *
 * En el celular no hay puntero que seguir: cada renglón muestra su foto al lado y
 * el resto del diseño queda igual.
 */
@Component({
  selector: 'app-template-estela',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
    CursorTrailDirective,
    MagneticDirective,
  ],
  templateUrl: './template-estela.component.html',
  host: { class: 'tpl-estela block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateEstelaComponent extends MotionTemplateBase {
  /** Categoría sobre la que está el puntero (o el foco). */
  protected readonly activa = signal<string | null>(null);

  /** La foto que persigue al puntero: la de la categoría activa. */
  readonly fotoActiva = computed<string | null>(() => {
    const id = this.activa();
    return id ? (this.fotoDeCategoria()[id] ?? null) : null;
  });

  /**
   * Las tres copias de la estela, de la más perezosa a la más pegada al puntero
   * (el número es cuánto se acerca por frame; lo lee `appCursorTrail`). Van en
   * ese orden para que la más pegada quede dibujada arriba.
   */
  protected readonly estelas = ['0.07', '0.12', '0.22'];
}
