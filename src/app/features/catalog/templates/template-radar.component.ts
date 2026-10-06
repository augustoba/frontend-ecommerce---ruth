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
 * Diseño "Radar": una pantalla que barre. La home es oscura (sólo la home,
 * como Foco) y el hero es un radar: un haz gira sin parar y las categorías reales
 * son las señales, repartidas en círculo, que laten y se pueden tocar para
 * filtrar. Los botones emiten ondas, un haz de lectura barre las fotos al
 * señalarlas y las promos llegan como transmisiones.
 *
 * Las señales se ubican con `--a` (ángulo) y `--r` (distancia al centro, que
 * alterna para que no queden todas en el mismo anillo). Son botones de verdad,
 * con su nombre visible.
 */
@Component({
  selector: 'app-template-radar',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-radar.component.html',
  host: { class: 'tpl-radar block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateRadarComponent extends MotionTemplateBase {}
