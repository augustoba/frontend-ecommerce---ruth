import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { TemplateRuthComponent } from '../templates/template-ruth.component';
import { TemplateEditorialComponent } from '../templates/template-editorial.component';
import { TemplatePopComponent } from '../templates/template-pop.component';
import { ProductService } from '../../../core/services/product.service';
import { ParamService } from '../../../core/services/param.service';
import { SizeScaleService } from '../../../core/services/size-scale.service';
import { SettingsService } from '../../../core/services/settings.service';
import { HeroSlidesService } from '../../../core/services/hero-slides.service';
import { Product, productHasParam } from '../../../core/models/product.model';
import { isKnownLayout } from '../../../core/layouts';
import { CatalogView, SortOrder } from '../catalog-view';

/**
 * Contenedor de la home: se queda con TODA la lógica (filtros, orden,
 * paginación, estados) y se la entrega entera a la plantilla que corresponda
 * mediante `vm`. El markup vive en `features/catalog/templates/`, así que cada
 * diseño es dueño de su propia estructura y no sólo del hero.
 */
@Component({
  selector: 'app-catalog-page',
  imports: [TemplateRuthComponent, TemplateEditorialComponent, TemplatePopComponent],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.css',
})
export class CatalogPageComponent implements CatalogView {
  private readonly productService = inject(ProductService);
  private readonly paramService = inject(ParamService);
  private readonly sizeScaleService = inject(SizeScaleService);
  private readonly settingsService = inject(SettingsService);
  private readonly heroSlidesService = inject(HeroSlidesService);

  /**
   * Fuerza un diseño ignorando el que eligió el dueño. Lo usa la pantalla
   * `/admin/config/diseno` para mostrar miniaturas vivas de cada opción.
   */
  readonly layoutOverride = input<string | null>(null);

  /**
   * Modo miniatura: pocas prendas y sin "lo más vendido". Va junto a
   * `layoutOverride` — la pantalla de Diseño muestra las tres plantillas a la
   * vez, y sin este recorte cada una bajaría el catálogo completo con sus fotos.
   */
  readonly preview = input(false);

  readonly layout = computed(() => {
    const override = this.layoutOverride();
    if (override && isKnownLayout(override)) return override;
    return this.settingsService.layout();
  });

  /** Se pasa a las plantillas como un único view-model. */
  readonly vm: CatalogView = this;

  readonly storeName = computed(() => this.settingsService.settings().storeName);
  readonly logoSrc = this.settingsService.logoSrc;

  /** Fotos del carrusel de bienvenida — administrables desde /admin/carrusel */
  readonly heroSlides = this.heroSlidesService.slides;

  readonly catalogStatus = this.productService.catalogStatus;
  readonly reloadCatalog = () => this.productService.reloadCatalog();
  /**
   * Los más vendidos — se muestran arriba de la grilla si no hay filtros
   * activos. En miniatura va vacío: las tres plantillas ya lo preguntan con un
   * `@if`, así que la sección se salta sola sin agregar otra bandera.
   */
  readonly bestSellers = computed<Product[]>(() =>
    this.preview() ? [] : this.productService.bestSellers()
  );

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
  /** Rango de precio (ARS). null = sin límite. */
  readonly minPrice = signal<number | null>(null);
  readonly maxPrice = signal<number | null>(null);
  /** Orden de la grilla: 'novedades' respeta el orden del backend (más nuevos primero). */
  readonly sortBy = signal<SortOrder>('novedades');

  setMinPrice(value: string): void {
    const n = Number(value);
    this.minPrice.set(value === '' || !Number.isFinite(n) || n < 0 ? null : n);
  }
  setMaxPrice(value: string): void {
    const n = Number(value);
    this.maxPrice.set(value === '' || !Number.isFinite(n) || n < 0 ? null : n);
  }

  readonly hasActiveFilters = computed(
    () =>
      !!this.searchTerm() ||
      this.selectedSize() !== 'todos' ||
      this.minPrice() !== null ||
      this.maxPrice() !== null ||
      Object.values(this.selectedParams()).some((v) => !!v)
  );

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const size = this.selectedSize();
    const params = this.selectedParams();
    const min = this.minPrice();
    const max = this.maxPrice();

    const list = this.productService.availableProducts().filter((product) => {
      const matchesTerm = !term || product.name.toLowerCase().includes(term);
      const matchesSize = size === 'todos' || product.sizeStocks.some((s) => s.size === size);
      const matchesParams = Object.entries(params).every(
        ([groupId, optionId]) => !optionId || productHasParam(product, groupId, optionId)
      );
      const matchesPrice =
        (min === null || product.price >= min) && (max === null || product.price <= max);
      return matchesTerm && matchesSize && matchesParams && matchesPrice;
    });

    const sort = this.sortBy();
    if (sort === 'precio-asc') return [...list].sort((a, b) => a.price - b.price);
    if (sort === 'precio-desc') return [...list].sort((a, b) => b.price - a.price);
    return list;
  });

  /** Paginación client-side: cuántos productos se muestran (crece con "Ver más"). */
  private readonly PAGE_SIZE = 12;
  /** En miniatura alcanzan unas pocas prendas para que se vea cómo arma la grilla. */
  private readonly PREVIEW_SIZE = 4;
  readonly shownCount = signal(this.PAGE_SIZE);
  readonly visibleProducts = computed(() =>
    this.filteredProducts().slice(0, this.preview() ? this.PREVIEW_SIZE : this.shownCount())
  );
  readonly hasMore = computed(
    () => !this.preview() && this.filteredProducts().length > this.shownCount()
  );
  showMore(): void {
    this.shownCount.update((n) => n + this.PAGE_SIZE);
  }

  constructor() {
    // Al cambiar cualquier filtro/orden, volver a la primera "página".
    effect(() => {
      this.searchTerm();
      this.selectedSize();
      this.selectedParams();
      this.minPrice();
      this.maxPrice();
      this.sortBy();
      this.shownCount.set(this.PAGE_SIZE);
    });
  }

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
    this.minPrice.set(null);
    this.maxPrice.set(null);
  }

  /** Baja con scroll suave a la grilla del catálogo (evita el salto raro del `href="#..."`). */
  scrollToCatalog(): void {
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
