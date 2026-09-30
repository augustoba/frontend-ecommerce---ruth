import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogView } from '../catalog-view';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Pop": neo-brutalista y bien infantil. Bordes negros gruesos, sombras
 * duras desplazadas, calcomanías rotadas que flotan, marquesina arriba de todo y
 * tarjetas que entran rebotando. Nada de degradados ni de esquinas redondeadas
 * (los radios los pisa `[data-layout="pop"]` en `styles.css`).
 */
@Component({
  selector: 'app-template-pop',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-pop.component.html',
  host: {
    // Idem Editorial: las variables del diseño van también en el host para que
    // la miniatura viva del admin se vea correcta con cualquier diseño activo.
    class: 'tpl-pop block bg-brand-50 text-stone-900',
  },
})
export class TemplatePopComponent {
  readonly vm = input.required<CatalogView>();

  /** Alterna la inclinación de las tarjetas para que nada quede perfectamente derecho. */
  protected tilt(index: number): string {
    return index % 2 === 0 ? 'sm:rotate-1' : 'sm:-rotate-2';
  }
}
