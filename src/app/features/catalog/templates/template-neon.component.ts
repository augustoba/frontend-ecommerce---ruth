import { Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogView } from '../catalog-view';
import { Product, totalStock } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Neón": el único OSCURO de la tienda y el más disruptivo de los nueve.
 * Es un cartel de neón / arcade: fondo casi negro con una grilla luminosa que se
 * mueve sola (`.neon-grid`), tipografía Orbitron, cian eléctrico y amarillo ácido.
 * No comparte ningún recurso con los otros diseños: no hay hero con foto grande y
 * texto encima (Nova), ni grilla clásica, ni rieles por categoría (Vidriera), ni
 * ficha técnica (Fichero) ni bento (Mosaico). Lo que lo define es el MOVIMIENTO:
 * el título entra letra por letra, dos marquesinas cruzadas, banners de promo con
 * anillo que gira, una cinta torcida y las prendas que se dan vuelta (flip 3D).
 *
 * La oscuridad no la hace este componente: sale de invertir la rampa `brand-*` en
 * `[data-layout="neon"], .tpl-neon` (`styles.css`), donde `brand-50` es el fondo
 * casi negro y `brand-500` el cian. Como el `body` usa `brand-50`, se oscurece
 * toda la tienda —header y footer incluidos—, y por eso acá no hay `styleUrl` ni
 * un solo color literal salvo el amarillo ácido (`#eaff00`), que vive en
 * `.neon-disc` y en los pocos lugares donde hace falta suelto.
 *
 * Componente tonto a propósito: no inyecta servicios ni pide datos, sólo lee el
 * `CatalogView` que arma `CatalogPageComponent` y resuelve helpers de
 * presentación (las letras del cartel, los textos de las cintas, las prendas con
 * stock bajo real). No hay reseñas, cuotas, testimonios ni contadores: sólo
 * `CatalogView`, `Product` y `SiteSettings`.
 */
@Component({
  selector: 'app-template-neon',
  imports: [
    CurrencyPipe,
    RouterLink,
    FormsModule,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-neon.component.html',
  host: {
    // Los tokens del diseño van también en el host (no sólo en
    // `html[data-layout]`) para que la miniatura viva de /admin/config/diseno se
    // vea oscura y con la tipografía arcade aunque la tienda use otro diseño.
    class: 'tpl-neon block bg-brand-50 text-zinc-100',
  },
})
export class TemplateNeonComponent {
  readonly vm = input.required<CatalogView>();

  /**
   * Cómo se compra hoy. Son los dos caminos REALES y excluyentes de la tienda
   * (lo decide el backend con `mercadoPagoAvailable`): no es marketing ni un
   * lugar para inventar envíos.
   */
  readonly compraLine = computed(() =>
    !this.vm().settings().onlineSalesEnabled
      ? 'Mirá las prendas y consultanos por WhatsApp.'
      : this.vm().settings().mercadoPagoAvailable
        ? 'Sumás las prendas al carrito y pagás online con Mercado Pago.'
        : 'Sumás las prendas al carrito y coordinamos la compra por WhatsApp.'
  );

  /**
   * El nombre de la tienda LETRA POR LETRA: el cartel de neón se enciende
   * carácter por carácter, cada uno con su propio `appReveal` y un delay
   * escalonado. Los espacios se cambian por `\u00A0` porque cada letra va en un
   * `<span class="inline-block">` y un espacio normal colapsaría a cero.
   */
  readonly letras = computed<string[]>(() =>
    Array.from(this.vm().storeName()).map((letra) => (letra === ' ' ? '\u00A0' : letra))
  );

  /**
   * Textos de las cintas: las promos vigentes reales (`/api/discounts`, o sea lo
   * cargado en /admin/promociones) o, si no hay ninguna, los nombres de las
   * categorías reales del grupo "Público". Nunca los dos: nada de relleno.
   */
  readonly marcas = computed<string[]>(() => {
    const promos = this.vm().promos();
    return promos.length
      ? promos.map((promo) => promo.text)
      : (this.vm().publicoGroup()?.options ?? []).map((opcion) => opcion.label);
  });

  /**
   * Prendas que se están agotando DE VERDAD: stock total mayor a 0 (si es 0 ya
   * está agotada y no es urgencia, es un producto que no se puede comprar) y
   * menor o igual al umbral del producto (o al default global de 3). Es el mismo
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
   * Etiqueta del "Público" del producto (Bebé / Nena / Nene…) para la cara de la
   * tarjeta. Se resuelve contra las opciones que ya vienen en el `CatalogView`:
   * el producto guarda ids de parametría, no labels, y la plantilla no puede
   * inyectar `ParamService` (sería dejar de ser tonta).
   */
  protected categoriaDe(product: Product): string {
    const optionId = (product.params?.['grp-publico'] ?? [])[0];
    if (!optionId) return '';
    return this.vm().publicoGroup()?.options.find((opcion) => opcion.id === optionId)?.label ?? '';
  }

  /**
   * Chip de filtro "Público". El activo va cian lleno con texto oscuro y el resto
   * apagado. No usa `.neon-chip` porque esa clase vive fuera de las capas de
   * Tailwind y le ganaría en cascada al `bg-brand-500`; por eso el estilo se
   * arma entero acá y el template sólo elige entre los dos estados.
   */
  protected chipClass(active: boolean): string {
    const base =
      'inline-flex items-center rounded-full border px-3.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.14em]';
    return active
      ? `${base} border-brand-500 bg-brand-500 text-[#04121a]`
      : `${base} border-brand-300 bg-brand-100 text-brand-400 hover:border-brand-400`;
  }

  /** Talle del dorso: en cian si tiene stock real, tachado si está agotado. */
  protected sizeChipClass(available: boolean): string {
    return available
      ? 'border border-brand-300 px-2 py-0.5 text-[11px] text-brand-400'
      : 'border border-brand-300 px-2 py-0.5 text-[11px] text-zinc-600 line-through';
  }
}
