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
 * Diseño "Soga": ropa tendida. Todo cuelga de una soga con broches y se
 * hamaca: el cartel con el nombre de la tienda pende de dos hilos, las promos y
 * las categorías son etiquetas colgadas que se balancean cada una a su ritmo, y
 * las tarjetas del catálogo se mecen al señalarlas.
 *
 * El balanceo es un péndulo (`rotate` con el eje arriba, en el broche). Cada pieza
 * lleva un retraso distinto por `:nth-child`, para que no se muevan todas juntas
 * como un coro.
 */
@Component({
  selector: 'app-template-soga',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-soga.component.html',
  host: { class: 'tpl-soga block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateSogaComponent extends MotionTemplateBase {}
