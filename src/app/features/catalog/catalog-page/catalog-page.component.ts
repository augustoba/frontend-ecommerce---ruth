import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { ProductService } from '../../../core/services/product.service';
import { ParamService } from '../../../core/services/param.service';
import { SizeScaleService } from '../../../core/services/size-scale.service';
import { LOGO_FALLBACK, SettingsService } from '../../../core/services/settings.service';
import { HeroSlidesService } from '../../../core/services/hero-slides.service';
import { PageBlocksService } from '../../../core/services/page-blocks.service';
import { productHasParam } from '../../../core/models/product.model';

@Component({
  selector: 'app-catalog-page',
  imports: [FormsModule, RouterLink, ProductCardComponent, HeroCarouselComponent, SkeletonComponent, LogoComponent],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.css',
  host: { '[style.background-color]': 'pageBg()' },
})
export class CatalogPageComponent {
  private readonly productService = inject(ProductService);
  private readonly paramService = inject(ParamService);
  private readonly sizeScaleService = inject(SizeScaleService);
  private readonly settingsService = inject(SettingsService);
  private readonly heroSlidesService = inject(HeroSlidesService);
  private readonly pageBlocksService = inject(PageBlocksService);

  readonly storeName = computed(() => this.settingsService.settings().storeName);
  /**
   * `undefined` = usar el logo de `SiteSettings` de siempre; string (incluida
   * una data URL) u null = el que mande el asistente "Crear tienda", que
   * todavía no subió nada a Cloudinary (ver `TenantWizardComponent.logoDataUrl`).
   */
  readonly logoOverride = input<string | null | undefined>(undefined);
  readonly logoSrc = computed(() =>
    this.logoOverride() !== undefined ? this.logoOverride() || LOGO_FALLBACK : this.settingsService.logoSrc()
  );
  /**
   * Fuerza un layout puntual sin importar el de `SiteSettings` — sólo lo usa
   * la miniatura de "Apariencia" (`admin-appearance`) para mostrar cada
   * opción con el componente real. Ver PLAN_SAAS.md Fase 10.
   */
  readonly layoutOverride = input<string | undefined>(undefined);
  /**
   * Igual que `layoutOverride` pero para los 2 colores granulares que se
   * pintan dentro de esta misma página (texto de títulos y fondo general —
   * ver PLAN_SAAS.md Fase 10 ampliada): `undefined` = usar `SiteSettings`
   * de siempre; string u null = lo que mande el borrador de "Apariencia".
   */
  readonly textColorOverride = input<string | null | undefined>(undefined);
  readonly pageBgOverride = input<string | null | undefined>(undefined);
  readonly headingColor = computed(() =>
    this.textColorOverride() !== undefined ? this.textColorOverride() : this.settingsService.settings().textColor
  );
  readonly pageBg = computed(() =>
    this.pageBgOverride() !== undefined ? this.pageBgOverride() : this.settingsService.settings().pageBackgroundColor
  );
  /**
   * Layout de página elegido (ver PLAN_SAAS.md Fase 10) — eje independiente
   * de la paleta/theme. Hoy sólo cambia la sección de portada y la grilla
   * (ver el template): el resto de la lógica de catálogo es la misma para
   * cualquier layout.
   */
  readonly layout = computed(() => this.layoutOverride() ?? this.settingsService.settings().layout);
  /**
   * `layout()` acotado a las variantes que conoce `ProductCardComponent`
   * (fallback: `'classic'`) — `"boutique"` (Minna) usa la tarjeta `"editorial"`
   * (foto lisa, sin marco); el resto de los layouts usan la tarjeta clásica.
   */
  readonly cardVariant = computed<'classic' | 'editorial' | 'marketplace'>(() =>
    this.layout() === 'boutique' ? 'editorial' : 'classic'
  );
  /** Columnas de la grilla de producto — igual para todos los layouts hoy. */
  readonly gridColsClass = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6';

  /**
   * Primeras 3 opciones de parametría (cualquier grupo), para las tarjetas
   * de promo del layout `"mercado"` (Shopping Cart / Big Store / Online
   * Shop) — datos reales del catálogo, no inventados.
   */
  readonly topOptions = computed(() => {
    const out: { groupId: string; id: string; label: string }[] = [];
    for (const g of this.filterGroups()) {
      for (const o of g.options) {
        out.push({ groupId: g.id, id: o.id, label: o.label });
        if (out.length >= 3) return out;
      }
    }
    return out;
  });

  /** Fotos del carrusel de bienvenida — administrables desde /admin/carrusel */
  readonly heroSlides = this.heroSlidesService.slides;
  /** Bloques habilitados (ver PLAN_SAAS.md Fase 7) — personalizador visual. */
  readonly heroBlockVisible = this.pageBlocksService.isVisible('HERO');
  readonly featuredBlockVisible = this.pageBlocksService.isVisible('FEATURED_PRODUCTS');

  readonly catalogStatus = this.productService.catalogStatus;
  readonly reloadCatalog = () => this.productService.reloadCatalog();
  /** Los más vendidos — se muestran arriba de la grilla si no hay filtros activos. */
  readonly bestSellers = this.productService.bestSellers;

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
  readonly sortBy = signal<'novedades' | 'precio-asc' | 'precio-desc'>('novedades');

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
  readonly shownCount = signal(this.PAGE_SIZE);
  readonly visibleProducts = computed(() => this.filteredProducts().slice(0, this.shownCount()));
  readonly hasMore = computed(() => this.filteredProducts().length > this.shownCount());
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
