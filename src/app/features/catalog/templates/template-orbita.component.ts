import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { OrbitDirective } from '../../../shared/directives/orbit.directive';

/**
 * Diseño "Órbita": las prendas giran. La pieza central es un anillo 3D
 * (`appOrbit`) con lo más vendido —o las novedades, si todavía hay pocas ventas—
 * que gira solo, se arrastra con el dedo o el mouse y agranda la prenda que queda
 * de frente. Alrededor, órbitas que giran lento y categorías que flotan como
 * planetas.
 *
 * Con `prefers-reduced-motion`, o con menos de tres prendas, el anillo no se arma
 * y queda un riel plano que se desliza.
 */
@Component({
  selector: 'app-template-orbita',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
    OrbitDirective,
  ],
  templateUrl: './template-orbita.component.html',
  host: { class: 'tpl-orbita block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateOrbitaComponent extends MotionTemplateBase {}
