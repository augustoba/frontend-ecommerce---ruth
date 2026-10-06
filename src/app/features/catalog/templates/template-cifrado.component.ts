import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { ScrambleDirective } from '../../../shared/directives/scramble.directive';

/**
 * Diseño "Cifrado": los textos se descifran. El nombre de la tienda, los
 * títulos, las promos, los nombres de las categorías y el texto de los botones
 * arrancan como letras al azar y se acomodan hasta formar la palabra
 * (`appScramble`): al entrar en pantalla y, con mouse, cada vez que se los señala.
 *
 * Lo que se lee para comprar no se mezcla: nombres de prendas, precios y talles
 * están siempre fijos. Las fotos se "enfocan" (de borrosas a nítidas) y una barra
 * de lectura las recorre al señalarlas.
 */
@Component({
  selector: 'app-template-cifrado',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
    ScrambleDirective,
  ],
  templateUrl: './template-cifrado.component.html',
  host: { class: 'tpl-cifrado block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateCifradoComponent extends MotionTemplateBase {}
