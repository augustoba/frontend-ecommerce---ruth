import { Component, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogView, PromoLine } from '../catalog-view';
import { Product, totalStock } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Cohete": un viaje espacial para chicos. Es el segundo diseño oscuro
 * de la tienda (junto a Neón) y su gracia es el MOVIMIENTO propio de la noche
 * espacial: las estrellas titilan (`.space-stars`), las órbitas giran
 * (`.space-ring`, con dos radios y dos velocidades distintas para que no se
 * sincronicen), una nave cruza la pantalla de vez en cuando (`.rocket`) y pasan
 * estrellas fugaces (`.shooting-star`).
 *
 * La oscuridad no la hace este componente: sale de invertir la rampa `brand-*`
 * en `[data-layout="cohete"], .tpl-cohete` (`styles.css`), donde `brand-50` es
 * la noche y `brand-500` el índigo brillante. Como el `body` usa `brand-50`, se
 * oscurece toda la tienda, header y footer incluidos (esas dos reglas acotadas
 * son lo único que ningún otro diseño toca). Por eso acá no hay `styleUrl` ni
 * un solo color literal salvo los de la nave, que es un dibujo decorativo.
 *
 * Componente tonto a propósito: no inyecta servicios ni pide datos, sólo lee el
 * `CatalogView` que arma `CatalogPageComponent` y resuelve helpers de
 * presentación (la línea de compra, las prendas con stock bajo real y el texto
 * del chip de urgencia). Nada de reseñas, cuentos ni contadores inventados:
 * sólo `CatalogView`, `Product` y `SiteSettings`.
 */
@Component({
  selector: 'app-template-cohete',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-cohete.component.html',
  host: {
    // Los tokens del diseño van también en el host (no sólo en
    // `html[data-layout]`) para que la miniatura viva de /admin/config/diseno se
    // vea nocturna y con la tipografía de nave aunque la tienda use otro diseño.
    class: 'tpl-cohete block bg-brand-50 text-white',
  },
})
export class TemplateCoheteComponent {
  readonly vm = input.required<CatalogView>();

  /**
   * Cómo se compra hoy. Son los dos caminos REALES y excluyentes de la tienda
   * (lo decide el backend con `mercadoPagoAvailable`): la plantilla no promete
   * los dos ni inventa envíos, cuotas o plazos.
   */
  readonly compraLine = computed(() =>
    !this.vm().settings().onlineSalesEnabled
      ? 'Mirá las prendas y consultanos por WhatsApp.'
      : this.vm().settings().mercadoPagoAvailable
        ? 'Cargá el tanque: sumás las prendas al carrito y pagás online con Mercado Pago.'
        : 'Cargá el tanque: sumás las prendas al carrito y coordinamos la compra por WhatsApp.'
  );

  /**
   * El "% real" de una promo. Cero significa "envío gratis" (el backend manda 0
   * porque no descuenta plata), así que ahí no hay porcentaje que mostrar: el
   * template dice ENVÍO. Este computed existe para que esa regla no se repita
   * mezclada con el markup.
   */
  protected promoLabel(promo: PromoLine): string {
    return promo.percent > 0 ? `-${promo.percent}%` : 'ENVÍO';
  }

  /**
   * Prendas que se están agotando DE VERDAD: stock total mayor a 0 (si es 0 ya
   * está agotada y no es urgencia, es una prenda que no se puede comprar) y
   * menor o igual al umbral del producto, o al default global de 3. Es el mismo
   * criterio que usa la alerta de reposición del panel.
   */
  readonly prendasBajas = computed<Product[]>(() =>
    this.vm()
      .filteredProducts()
      .filter((product) => {
        const stock = totalStock(product);
        return stock > 0 && stock <= (product.lowStockThreshold ?? 3);
      })
  );

  /** Texto del chip de urgencia con el stock real: es un dato, no un cartel. */
  protected stockLabel(product: Product): string {
    const stock = totalStock(product);
    return stock === 1 ? '¡Última unidad!' : `Quedan ${stock}`;
  }

  /**
   * Chip de filtro "Público". El activo va índigo lleno y el resto apagado.
   * No usa `.space-chip` porque esa clase vive fuera de las capas de Tailwind y
   * le ganaría en cascada al `bg-brand-500`; por eso el estilo se arma entero
   * acá y el template sólo elige entre los dos estados.
   */
  protected chipClass(active: boolean): string {
    const base =
      'rounded-full px-3.5 py-1.5 text-[12px] font-semibold ring-1 transition-colors';
    return active
      ? `${base} bg-brand-500 text-white ring-brand-400`
      : `${base} bg-white/10 text-brand-300 ring-white/20 hover:ring-brand-400`;
  }
}
