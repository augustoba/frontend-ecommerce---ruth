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
 * Diseño "Pasarela": lo más vendido desfila. Al bajar, la página se "clava"
 * (`position: sticky`) y el scroll vertical se convierte en un desfile
 * horizontal de prendas; cuando pasó la última, la página sigue bajando.
 *
 * El desfile lo mueve `appScrollScene`, que escribe `--s` (0..1) en el riel; el
 * `translate` lo hace `.pasarela-track` en `styles.css`. Con
 * `prefers-reduced-motion` la escena se desarma y queda un riel común que se
 * desliza con el dedo.
 */
@Component({
  selector: 'app-template-pasarela',
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
  templateUrl: './template-pasarela.component.html',
  host: { class: 'tpl-pasarela block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplatePasarelaComponent extends MotionTemplateBase {}
