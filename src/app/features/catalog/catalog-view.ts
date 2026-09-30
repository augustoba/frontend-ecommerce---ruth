import { Signal, WritableSignal } from '@angular/core';
import { Product } from '../../core/models/product.model';
import { ParamGroup } from '../../core/models/param.model';
import { HeroSlideRecord } from '../../core/services/hero-slides.service';
import { LoadStatus } from '../../core/state/collection-store';

export type SortOrder = 'novedades' | 'precio-asc' | 'precio-desc';

/**
 * Todo lo que una plantilla necesita para dibujar la home. Lo arma
 * `CatalogPageComponent` (que se queda con la lógica: filtros, orden,
 * paginación, estados) y lo recibe cada componente de plantilla, que es dueño
 * de TODO su markup — hero, destacados, filtros y grilla.
 *
 * Es la diferencia clave con el sistema anterior de ramas `@if` dentro de un
 * único HTML: ahí sólo cambiaba el hero y el resto era literalmente el mismo
 * bloque para los 15 diseños, por eso todos se veían iguales.
 */
export interface CatalogView {
  readonly storeName: Signal<string>;
  readonly logoSrc: Signal<string>;
  readonly heroSlides: Signal<HeroSlideRecord[]>;

  readonly catalogStatus: Signal<LoadStatus>;
  readonly reloadCatalog: () => void;
  readonly bestSellers: Signal<Product[]>;

  /** Grupo "Público": cada plantilla decide si lo muestra como chips, links o select. */
  readonly publicoGroup: Signal<ParamGroup | undefined>;
  readonly selectGroups: Signal<ParamGroup[]>;
  readonly availableSizes: Signal<string[]>;

  readonly searchTerm: WritableSignal<string>;
  readonly selectedSize: WritableSignal<string>;
  readonly minPrice: Signal<number | null>;
  readonly maxPrice: Signal<number | null>;
  readonly sortBy: WritableSignal<SortOrder>;
  readonly hasActiveFilters: Signal<boolean>;

  readonly filteredProducts: Signal<Product[]>;
  readonly visibleProducts: Signal<Product[]>;
  readonly hasMore: Signal<boolean>;

  setMinPrice(value: string): void;
  setMaxPrice(value: string): void;
  showMore(): void;
  paramValue(groupId: string): string;
  setParam(groupId: string, optionId: string): void;
  clearFilters(): void;
  scrollToCatalog(): void;
}
