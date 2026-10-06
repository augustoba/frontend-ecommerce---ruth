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
 * Diseño "Líquido": nada tiene esquinas. Manchas que se deforman solas detrás
 * del hero, la foto dentro de una gota que cambia de forma, olas que corren
 * entre secciones y botones que se llenan de abajo hacia arriba.
 *
 * Es el único de la tanda que no necesita ninguna directiva nueva: todo es CSS.
 * El truco de las formas que "se deforman" es girar una figura asimétrica
 * (`.liquido-drop`) y contragirar lo de adentro, así sólo se anima `transform`
 * y la foto queda derecha mientras el borde parece líquido.
 */
@Component({
  selector: 'app-template-liquido',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-liquido.component.html',
  host: { class: 'tpl-liquido block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateLiquidoComponent extends MotionTemplateBase {}
