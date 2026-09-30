import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogView } from '../catalog-view';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';

/**
 * Diseño original de la tienda ("Ruth"). Markup idéntico al que tenía
 * `catalog-page.component.html` antes de separar las plantillas — se movió tal
 * cual para que la home no cambie ni un píxel.
 */
@Component({
  selector: 'app-template-ruth',
  imports: [FormsModule, ProductCardComponent, HeroCarouselComponent, SkeletonComponent, CldImagePipe],
  templateUrl: './template-ruth.component.html',
})
export class TemplateRuthComponent {
  readonly vm = input.required<CatalogView>();
}
