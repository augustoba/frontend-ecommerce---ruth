import { Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogView } from '../catalog-view';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Editorial": tipo revista de moda. Todo a escuadra, papel hueso, serif
 * de título gigante, foto a sangre con Ken Burns, los más vendidos como índice
 * numerado en vez de tarjetas y los filtros como links subrayados en vez de
 * píldoras. Las fuentes y la paleta las pisa `[data-layout="editorial"]` en
 * `styles.css`, así que también cambian el header y el footer.
 */
@Component({
  selector: 'app-template-editorial',
  imports: [
    FormsModule,
    RouterLink,
    CurrencyPipe,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-editorial.component.html',
  host: {
    // Las variables de tema del diseño viven acá además de en `html[data-layout]`,
    // para que las miniaturas vivas de /admin/config/diseno se vean con las
    // fuentes y la paleta correctas aunque el diseño activo sea otro.
    class: 'tpl-editorial block bg-brand-50 text-stone-800',
  },
})
export class TemplateEditorialComponent {
  readonly vm = input.required<CatalogView>();

  /** Foto del hero: la primera del carrusel, o el logo si todavía no hay fotos. */
  readonly heroImage = computed(
    () => this.vm().heroSlides()[0]?.imageUrl || this.vm().logoSrc()
  );

  /** "01", "02"... para el índice de más vendidos. */
  protected pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  /** Las dos primeras prendas de la página van a doble ancho en desktop. */
  protected spanClass(index: number): string {
    return index === 0 || index === 1 ? 'lg:col-span-6' : 'lg:col-span-4';
  }
}
