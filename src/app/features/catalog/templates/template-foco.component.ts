import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { SpotlightDirective } from '../../../shared/directives/spotlight.directive';

/**
 * Diseño "Foco": un reflector en la oscuridad. La home es oscura, pero —a
 * diferencia de Neón, Cohete y Cine— el resto de la tienda no: la rampa
 * invertida vive sólo en `.tpl-foco` (ver el comentario en `styles.css`). La foto del hero está en penumbra y en gris, y un
 * círculo de luz que sigue al puntero le devuelve el color (`appSpotlight` escribe
 * la posición; `.foco-color` la usa en una máscara radial). Las prendas del
 * catálogo hacen lo mismo en chico: apagadas hasta que se las señala.
 *
 * En táctil no hay puntero: el reflector se pasea solo por la foto y las prendas
 * se ven siempre en color. Con `prefers-reduced-motion` la foto queda en color,
 * sin reflector.
 */
@Component({
  selector: 'app-template-foco',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
    SpotlightDirective,
  ],
  templateUrl: './template-foco.component.html',
  host: { class: 'tpl-foco block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateFocoComponent extends MotionTemplateBase {
  /** La foto del escenario: la primera del carrusel o, si no hay, la de una prenda. */
  readonly fotoFoco = computed<string | null>(() => {
    const v = this.vm();
    return v.heroSlides()[0]?.imageUrl ?? v.filteredProducts()[0]?.imageUrl ?? null;
  });
}
