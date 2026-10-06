import { Component } from '@angular/core';
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
 * Diseño "Vórtice": todo gira. La foto del hero va en un disco rodeado por un
 * sello de texto circular que da vueltas sin parar, las fotos de las categorías
 * rotan a medida que se baja (`appScrollScene` les escribe `--s`), los botones
 * tienen un borde cónico que gira y las tarjetas se tuercen al señalarlas.
 *
 * El sello es un SVG con `textPath`: el texto sigue el círculo y lo que gira es el
 * SVG entero (`transform`). Decorativo, `aria-hidden`.
 */
@Component({
  selector: 'app-template-vortice',
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
  templateUrl: './template-vortice.component.html',
  host: { class: 'tpl-vortice block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateVorticeComponent extends MotionTemplateBase {}
