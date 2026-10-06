import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { TiltDirective } from '../../../shared/directives/tilt.directive';

/**
 * Diseño "Holograma": tornasol. Las tarjetas, las fotos y el hero se inclinan
 * siguiendo al puntero (`appTilt`) y una lámina tornasolada (`.holo-foil`) cambia
 * de color según por dónde pasa: usa las mismas `--mx`/`--my` que escribe la
 * directiva. Los botones tienen un degradé iridiscente que corre solo.
 *
 * En táctil no hay puntero: la lámina hace un barrido lento y continuo, así el
 * efecto no desaparece en el celular.
 */
@Component({
  selector: 'app-template-holograma',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
    TiltDirective,
  ],
  templateUrl: './template-holograma.component.html',
  host: { class: 'tpl-holograma block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateHologramaComponent extends MotionTemplateBase {}
