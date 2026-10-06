import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { Product } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Origami": todo es papel doblado. Las secciones se despliegan desde
 * arriba al entrar en pantalla (`appReveal variant="fold"`), las piezas se dan
 * vuelta como una hoja (`flip`), las esquinas vienen dobladas y cada prenda trae
 * una solapa que se abre al pasar el mouse y muestra los talles con stock.
 *
 * En táctil no hay "pasar el mouse": la solapa viene abierta, así los talles se
 * ven siempre.
 */
@Component({
  selector: 'app-template-origami',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-origami.component.html',
  host: { class: 'tpl-origami block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateOrigamiComponent extends MotionTemplateBase {
  /** Talles con stock de una prenda, para la solapa. Vacío = sin stock. */
  protected tallesDe(product: Product): string[] {
    return product.sizeStocks.filter((s) => s.stock > 0).map((s) => s.size);
  }
}
