import { Component, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogView } from '../catalog-view';
import { Product } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Caramelo": el pastel de los MÁS CHICOS. Fondo menta muy claro, acentos
 * rosa/lila/amarillo pastel, TODO redondo (los radios son enormes) y blandito.
 * Tipografías Grandstander (títulos) + Quicksand (texto), las dos redondeadas.
 *
 * Su movimiento propio, el que ningún otro diseño tiene, son las tres clases
 * `.candy-*` de `styles.css`: los RAYOS que giran solos detrás del logo
 * (`.candy-sun`), las MANCHAS que flotan (`.candy-blob`, cada una con su propio
 * `animation-delay` para que no se muevan sincronizadas), las ONDAS de nube que
 * corren entre secciones (`.candy-scallop`) y el apretón de goma de los botones
 * (`.jelly-hover`).
 *
 * Componente tonto a propósito: no inyecta servicios ni pide datos, sólo lee el
 * `CatalogView` que arma `CatalogPageComponent` y resuelve helpers/computeds de
 * presentación. Los tokens del diseño (paleta menta + pasteles, radios enormes y
 * las dos fuentes) los pisa `[data-layout="caramelo"], .tpl-caramelo` en
 * `styles.css`, por eso acá no hay `styleUrl` ni un solo color hexadecimal.
 */
@Component({
  selector: 'app-template-caramelo',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-caramelo.component.html',
  host: {
    // Los tokens van también en el host (no sólo en `html[data-layout]`) para que
    // la miniatura viva de /admin/config/diseno se vea pastel y redondeada aunque
    // el diseño activo de la tienda sea otro. Sin `styleUrl`: el CSS propio vive
    // en `styles.css` por el presupuesto de `anyComponentStyle`.
    class: 'tpl-caramelo block bg-brand-50 text-stone-800',
  },
})
export class TemplateCarameloComponent {
  readonly vm = input.required<CatalogView>();

  /**
   * Cómo se compra hoy. Son los dos caminos REALES y excluyentes de la tienda
   * (lo decide el backend con `mercadoPagoAvailable`): no es marketing ni un
   * lugar para inventar envíos, cuotas ni promesas.
   */
  readonly compraLine = computed(() =>
    !this.vm().settings().onlineSalesEnabled
      ? 'Mirá las prendas y consultanos por WhatsApp.'
      : this.vm().settings().mercadoPagoAvailable
        ? 'Sumás las prendas al carrito y pagás online con Mercado Pago.'
        : 'Sumás las prendas al carrito y coordinamos la compra por WhatsApp.'
  );

  /**
   * Las prendas MÁS NUEVAS de verdad: el catálogo filtrado ordenado por
   * `createdAt` de más nueva a más vieja. `createdAt` es ISO-8601, así que el
   * orden alfabético ya es cronológico y no hace falta parsear fechas. Se corta
   * en 8: es un carril para ojear, no una segunda grilla.
   */
  readonly recienLlegados = computed<Product[]>(() =>
    [...this.vm().filteredProducts()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 8)
  );

  /**
   * Color pastel de la burbuja de promo, rotando entre los tres que existen. Es
   * sólo presentación: con una promo sola igual arranca en rosa, sin depender de
   * que haya tres cargadas.
   */
  readonly candyColors = ['candy-pink', 'candy-lilac', 'candy-yellow'] as const;

  protected colorDePromo(index: number): string {
    return this.candyColors[index % this.candyColors.length];
  }

  /**
   * Clase del chip "Público": el activo va menta llena con texto blanco y el
   * resto queda en blanco con anillo pastel. Se arma entero acá (y no con
   * `[class.x]` sueltos) para no repetir los diez bindings en cada chip.
   */
  protected chipPublico(active: boolean): string {
    const base =
      'rounded-full px-4 py-2 font-display text-[13px] font-bold transition-colors duration-200';
    return active
      ? `${base} bg-brand-500 text-white`
      : `${base} bg-white text-stone-600 ring-2 ring-brand-200 hover:ring-brand-400`;
  }
}
