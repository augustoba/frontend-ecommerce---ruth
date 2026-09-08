import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { ProductService } from '../../../core/services/product.service';
import { HeroSlidesService } from '../../../core/services/hero-slides.service';
import { Product, ProductSize } from '../../../core/models/product.model';

type CategoryFilter = Product['category'] | 'todas';

@Component({
  selector: 'app-catalog-page',
  imports: [FormsModule, ProductCardComponent, HeroCarouselComponent],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.css',
})
export class CatalogPageComponent {
  private readonly productService = inject(ProductService);
  private readonly heroSlidesService = inject(HeroSlidesService);

  /** Fotos del carrusel de bienvenida — administrables desde /admin/carrusel */
  readonly heroSlides = this.heroSlidesService.slides;
  readonly categories = this.productService.categories;
  readonly sizes: ProductSize[] = [
    'RN', '0-3M', '3-6M', '6-12M', '1', '2', '3', '4', '6', '8', '10', '12', '14', '16',
  ];

  readonly searchTerm = signal('');
  readonly selectedCategory = signal<CategoryFilter>('todas');
  readonly selectedSize = signal<ProductSize | 'todos'>('todos');

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();
    const size = this.selectedSize();

    return this.productService.availableProducts().filter((product) => {
      const matchesTerm = !term || product.name.toLowerCase().includes(term);
      const matchesCategory = category === 'todas' || product.category === category;
      const matchesSize = size === 'todos' || product.sizeStocks.some((s) => s.size === size);
      return matchesTerm && matchesCategory && matchesSize;
    });
  });

  setCategory(category: CategoryFilter): void {
    this.selectedCategory.set(category);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set('todas');
    this.selectedSize.set('todos');
  }
}
