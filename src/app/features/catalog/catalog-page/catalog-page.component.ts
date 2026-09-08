import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { ProductService } from '../../../core/services/product.service';
import { ParamService } from '../../../core/services/param.service';
import { HeroSlidesService } from '../../../core/services/hero-slides.service';
import { ProductSize, productHasParam } from '../../../core/models/product.model';

@Component({
  selector: 'app-catalog-page',
  imports: [FormsModule, ProductCardComponent, HeroCarouselComponent],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.css',
})
export class CatalogPageComponent {
  private readonly productService = inject(ProductService);
  private readonly paramService = inject(ParamService);
  private readonly heroSlidesService = inject(HeroSlidesService);

  /** Fotos del carrusel de bienvenida — administrables desde /admin/carrusel */
  readonly heroSlides = this.heroSlidesService.slides;

  /** Grupos de parametrías que se muestran como filtro */
  readonly filterGroups = this.paramService.catalogGroups;
  /** Grupo "Público": se muestra como botones; el resto como selectores */
  readonly publicoGroup = computed(() =>
    this.filterGroups().find((g) => g.id === 'grp-publico')
  );
  readonly selectGroups = computed(() =>
    this.filterGroups().filter((g) => g.id !== 'grp-publico')
  );

  readonly sizes: ProductSize[] = [
    'RN', '0-3M', '3-6M', '6-12M', '1', '2', '3', '4', '6', '8', '10', '12', '14', '16',
  ];

  readonly searchTerm = signal('');
  readonly selectedSize = signal<ProductSize | 'todos'>('todos');
  /** { [groupId]: optionId } — sin entrada o '' significa "todas" */
  readonly selectedParams = signal<Record<string, string>>({});

  readonly hasActiveFilters = computed(
    () =>
      !!this.searchTerm() ||
      this.selectedSize() !== 'todos' ||
      Object.values(this.selectedParams()).some((v) => !!v)
  );

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const size = this.selectedSize();
    const params = this.selectedParams();

    return this.productService.availableProducts().filter((product) => {
      const matchesTerm = !term || product.name.toLowerCase().includes(term);
      const matchesSize = size === 'todos' || product.sizeStocks.some((s) => s.size === size);
      const matchesParams = Object.entries(params).every(
        ([groupId, optionId]) => !optionId || productHasParam(product, groupId, optionId)
      );
      return matchesTerm && matchesSize && matchesParams;
    });
  });

  paramValue(groupId: string): string {
    return this.selectedParams()[groupId] ?? '';
  }

  setParam(groupId: string, optionId: string): void {
    this.selectedParams.update((current) => {
      const next = { ...current };
      if (!optionId || next[groupId] === optionId) {
        delete next[groupId];
      } else {
        next[groupId] = optionId;
      }
      return next;
    });
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedSize.set('todos');
    this.selectedParams.set({});
  }
}
