import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { TypewriterDirective } from '../../../shared/directives/typewriter.directive';

/**
 * Diseño "Teletipo": los títulos se escriben solos. El nombre de la tienda y
 * cada título de sección aparecen letra por letra cuando entran en pantalla, con
 * el cursor parpadeando al final, como un despacho que va llegando
 * (`appTypewriter`). Todo va en tipografía de máquina sobre papel.
 *
 * Los títulos se escriben; el resto no. Precios, nombres de prendas y botones
 * están siempre a la vista: lo que se lee para comprar no se hace esperar.
 */
@Component({
  selector: 'app-template-teletipo',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
    TypewriterDirective,
  ],
  templateUrl: './template-teletipo.component.html',
  host: { class: 'tpl-teletipo block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateTeletipoComponent extends MotionTemplateBase {}
