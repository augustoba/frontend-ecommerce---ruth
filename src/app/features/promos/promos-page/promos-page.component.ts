import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { DiscountService } from '../../../core/services/discount.service';
import { ProductService } from '../../../core/services/product.service';
import { SettingsService } from '../../../core/services/settings.service';
import {
  ProductCardComponent,
  ProductCardVariant,
} from '../../../shared/components/product-card/product-card.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

/**
 * Variante de tarjeta por diseño activo. Es el mismo mapeo que usan las
 * plantillas de la home, repetido acá porque esta página vive fuera del
 * `CatalogView`: no tiene `vm` del que sacarlo, sólo el id del diseño.
 * Fichero no tiene variante propia (su home usa filas, no tarjetas) → classic.
 */
const VARIANT_BY_LAYOUT: Record<string, ProductCardVariant> = {
  ruth: 'classic',
  editorial: 'editorial',
  pop: 'pop',
  vidriera: 'vidriera',
  ofertas: 'oferta',
  fichero: 'classic',
  mosaico: 'mosaico',
  nova: 'nova',
  neon: 'neon',
  caramelo: 'caramelo',
  cohete: 'cohete',
  jungla: 'jungla',
  crayon: 'crayon',
  boutique: 'boutique',
  feria: 'feria',
  periodico: 'periodico',
  retro: 'retro',
  suizo: 'suizo',
  cancha: 'cancha',
  cine: 'cine',
  playa: 'playa',
  pasarela: 'pasarela',
  baraja: 'baraja',
  liquido: 'liquido',
  kinetico: 'kinetico',
  orbita: 'orbita',
  estela: 'estela',
  origami: 'origami',
  historias: 'historias',
  portal: 'portal',
};

/**
 * Vista pública "Promociones" (`/promos`): la que puede abrir el link del
 * banner promocional o el "Ver promos" del diseño Neón. El chrome (header,
 * footer, WhatsApp, banner) lo pone `AppComponent`; acá va sólo el contenido.
 *
 * Qué muestra, por prioridad:
 *  1. Las prendas marcadas a mano con "Mostrar en promos" en el panel
 *     (`featuredInPromos`).
 *  2. Si no hay ninguna marcada, las prendas con descuento por parametría
 *     vigente — las mismas de `/admin/promociones` que ya marcan el precio en
 *     los diseños que lo muestran.
 *
 * El chip "-N%" comunica el % real vigente; el descuento se aplica solo en el
 * carrito (mismo criterio que el diseño Ofertas). La tarjeta sale con la
 * variante del diseño activo para que la página no desentone con la tienda.
 */
@Component({
  selector: 'app-promos-page',
  imports: [RouterLink, ProductCardComponent, SkeletonComponent],
  templateUrl: './promos-page.component.html',
})
export class PromosPageComponent {
  private readonly productService = inject(ProductService);
  private readonly discountService = inject(DiscountService);
  private readonly settingsService = inject(SettingsService);

  readonly storeName = computed(() => this.settingsService.settings().storeName);
  readonly cardVariant = computed<ProductCardVariant>(
    () => VARIANT_BY_LAYOUT[this.settingsService.layout()] ?? 'classic'
  );

  private readonly products = this.productService.availableProducts;

  /** Elegidas a mano en el panel ("Mostrar en promos"). */
  private readonly manual = computed(() =>
    this.products().filter((product) => product.featuredInPromos)
  );

  /** Con descuento por parametría vigente, de mayor a menor %. */
  private readonly auto = computed(() =>
    this.products()
      .map((product) => ({ product, percent: this.discountService.percentForProduct(product) }))
      .filter((entry) => entry.percent > 0)
      .sort((a, b) => b.percent - a.percent)
      .map((entry) => entry.product)
  );

  readonly usingManual = computed(() => this.manual().length > 0);
  readonly list = computed(() => (this.usingManual() ? this.manual() : this.auto()));

  readonly loading = computed(
    () =>
      this.productService.catalogLoading() ||
      this.discountService.status() === 'idle' ||
      this.discountService.status() === 'loading'
  );
  readonly errored = computed(() => this.productService.catalogErrored());

  /** El % vigente de una prenda (0 = sin descuento → sin chip). */
  discountFor(product: Product): number {
    return this.discountService.percentForProduct(product);
  }

  reload(): void {
    this.productService.reloadCatalog();
    this.discountService.reload();
  }
}
