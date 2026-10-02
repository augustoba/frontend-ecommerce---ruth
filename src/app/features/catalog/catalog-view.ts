import { Signal, WritableSignal } from '@angular/core';
import { Product } from '../../core/models/product.model';
import { ParamGroup } from '../../core/models/param.model';
import { DiscountKind } from '../../core/models/discount.model';
import { HeroSlideRecord } from '../../core/services/hero-slides.service';
import { SiteSettings } from '../../core/services/settings.service';
import { LoadStatus } from '../../core/state/collection-store';

export type SortOrder = 'novedades' | 'precio-asc' | 'precio-desc';

/**
 * Un descuento vigente con el texto ya armado, listo para dibujar. Lo arma el
 * contenedor (que tiene el `DiscountService` y los labels de parametrías y de
 * medios de pago) para que la plantilla no tenga que traducir ids a frases.
 *
 * Sale de `/api/discounts`, que es **público** y trae los descuentos reales
 * cargados en `/admin/promociones` con su vigencia ya calculada por el backend.
 */
export interface PromoLine {
  id: string;
  kind: DiscountKind;
  /** Frase corta y real, ej: "Compra mayor a $50.000 → 10% off". */
  text: string;
  /** Letra chica configurable del descuento (ej: "solo microcentro"). */
  detail: string | null;
  /** 0 en "envío gratis" (es informativo, no descuenta plata). */
  percent: number;
  /**
   * Hasta cuándo vale, ya formateado ("Hasta el 15/10"), o null si la promo no
   * tiene fecha de fin. Se arma acá y no en la plantilla a propósito: `endsAt`
   * es una fecha suelta (YYYY-MM-DD) y pasarla por el `DatePipe` la interpreta
   * como UTC, lo que en Argentina la mostraría un día antes.
   */
  endsLabel: string | null;
}

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

  /**
   * Todos los datos del local (`/api/settings`): foto del local, "sobre
   * nosotros", dirección, redes. Los necesita, por ejemplo, el Mosaico, que
   * arma un bloque con la foto del local y un recorte del "sobre nosotros" que
   * hoy sólo aparecen en el footer.
   */
  readonly settings: Signal<SiteSettings>;

  /**
   * Descuentos vigentes, ya con el texto armado. Vacío = no hay ninguna promo
   * cargada (o el backend no respondió): la plantilla que los use tiene que
   * aguantarse sin la barra.
   */
  readonly promos: Signal<PromoLine[]>;

  /**
   * El % de descuento por parametría que le corresponde a una prenda puntual
   * (0 = ninguno). Es el mayor entre los descuentos vigentes que apuntan a
   * alguna de sus parametrías. Sólo miran esto los diseños que marcan precios.
   */
  discountPercentFor(product: Product): number;

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
