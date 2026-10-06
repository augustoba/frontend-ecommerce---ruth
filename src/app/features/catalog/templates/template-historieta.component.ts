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
 * Diseño "Historieta": una página de cómic. Las secciones son viñetas con
 * borde grueso y trama de puntos, la línea de compra va en un globo de diálogo,
 * las promos son estallidos que laten, detrás de cada botón salta una estrella al
 * señalarlo y las fotos se enderezan y pierden la trama cuando se las mira.
 *
 * Los estallidos son `clip-path` en forma de estrella; lo que late es sólo su
 * `transform`.
 */
@Component({
  selector: 'app-template-historieta',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-historieta.component.html',
  host: { class: 'tpl-historieta block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateHistorietaComponent extends MotionTemplateBase {}
