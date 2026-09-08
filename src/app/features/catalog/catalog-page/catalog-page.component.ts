import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ProductService } from '../../../core/services/product.service';
import { ParamService } from '../../../core/services/param.service';
import { SizeScaleService } from '../../../core/services/size-scale.service';
import { SettingsService } from '../../../core/services/settings.service';
import { HeroSlidesService } from '../../../core/services/hero-slides.service';
import { productHasParam } from '../../../core/models/product.model';

@Component({
  selector: 'app-catalog-page',
  imports: [FormsModule, ProductCardComponent, HeroCarouselComponent, SkeletonComponent],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.css',
})
export class CatalogPageComponent {
  private readonly productService = inject(ProductService);
  private readonly paramService = inject(ParamService);
  private readonly sizeScaleService = inject(SizeScaleService);
  private readonly settingsService = inject(SettingsService);
  private readonly heroSlidesService = inject(HeroSlidesService);

  readonly storeName = computed(() => this.settingsService.settings().storeName);
  readonly logoSrc = this.settingsService.logoSrc;

  /** Fotos del carrusel de bienvenida — administrables desde /admin/carrusel */
  readonly heroSlides = this.heroSlidesService.slides;

  readonly catalogStatus = this.productService.catalogStatus;
  readonly reloadCatalog = () => this.productService.reloadCatalog();

  /** Grupos de parametrías que se muestran como filtro */
  readonly filterGroups = this.paramService.catalogGroups;
  /** Grupo "Público": se muestra como botones; el resto como selectores */
  readonly publicoGroup = computed(() =>
    this.filterGroups().find((g) => g.id === 'grp-publico')
  );
  readonly selectGroups = computed(() =>
    this.filterGroups().filter((g) => g.id !== 'grp-publico')
  );

  /**
   * Talles que existen en el catálogo, ordenados según el orden en que aparecen
   * en las escalas de talle (y al final los que no están en ninguna).
   */
  readonly availableSizes = computed(() => {
    const present = new Set<string>();
    for (const p of this.productService.availableProducts()) {
      for (const s of p.sizeStocks) present.add(s.size);
    }
    const ordered: string[] = [];
    for (const scale of this.sizeScaleService.scales()) {
      for (const v of scale.values) {
        if (present.has(v) && !ordered.includes(v)) ordered.push(v);
      }
    }
    for (const v of present) {
      if (!ordered.includes(v)) ordered.push(v);
    }
    return ordered;
  });

  readonly searchTerm = signal('');
  readonly selectedSize = signal<string>('todos');
  /** { [groupId]: optionId } — sin entrada o '' significa "todas" */
  readonly selectedParams = signal<Record<string, string>>({});
  /** Orden de la grilla: 'novedades' respeta el orden del backend (más nuevos primero). */
  readonly sortBy = signal<'novedades' | 'precio-asc' | 'precio-desc'>('novedades');

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

    const list = this.productService.availableProducts().filter((product) => {
      const matchesTerm = !term || product.name.toLowerCase().includes(term);
      const matchesSize = size === 'todos' || product.sizeStocks.some((s) => s.size === size);
      const matchesParams = Object.entries(params).every(
        ([groupId, optionId]) => !optionId || productHasParam(product, groupId, optionId)
      );
      return matchesTerm && matchesSize && matchesParams;
    });

    const sort = this.sortBy();
    if (sort === 'precio-asc') return [...list].sort((a, b) => a.price - b.price);
    if (sort === 'precio-desc') return [...list].sort((a, b) => b.price - a.price);
    return list;
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

  /** Baja con scroll suave a la grilla del catálogo (evita el salto raro del `href="#..."`). */
  scrollToCatalog(): void {
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
