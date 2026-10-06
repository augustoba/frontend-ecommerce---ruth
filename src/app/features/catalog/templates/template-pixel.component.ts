import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Pixel": un videojuego de 8 bits. Nada se mueve suave: todo va a
 * saltos (`steps()`). Las fotos se cargan renglón por renglón, como en una consola
 * vieja (`appReveal variant="slats"` marca `is-visible` y `.pixel-load` abre su
 * `clip-path` en ocho pasos), la cinta de promos avanza a los tirones, y los
 * botones bajan un escalón al apretarlos y hacen parpadear su flecha.
 *
 * La tipografía de píxeles es chica a propósito: es ancha y a tamaños grandes no
 * entra el nombre de la tienda en el celular.
 */
@Component({
  selector: 'app-template-pixel',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-pixel.component.html',
  host: { class: 'tpl-pixel block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplatePixelComponent extends MotionTemplateBase {}
