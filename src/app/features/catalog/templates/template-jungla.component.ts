import { Component, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogView } from '../catalog-view';
import { ParamOption } from '../../../core/models/param.model';
import { Product } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Jungla": una aventura en la selva de día para los más chicos. Verde
 * hoja, arena y madera, formas orgánicas (nada de rectángulos perfectos) y
 * tipografía Luckiest Guy + Comic Neue.
 *
 * Lo que lo define es su MOVIMIENTO propio, y todo sale de `styles.css`, no de
 * acá: la arboleda de arriba y las hojas de los costados se mecen como si
 * hubiera viento (`.jungla-top`, `.jungla-leaf` + `.sway` con un delay distinto
 * en cada hoja para que no se muevan en bloque), el camino de huellas marcha
 * solo (`.jungla-trail`) y las tarjetas se balancean al pasarles el mouse
 * (`.sway-hover`, que es el mismo `sway` pero disparado por hover).
 *
 * Componente tonto a propósito: no inyecta servicios ni pide datos, sólo lee el
 * `CatalogView` que arma `CatalogPageComponent` y resuelve helpers de
 * presentación (la línea de compra, el carril de destacados y el estilo del chip
 * activo). Los tokens del diseño (paleta verde + las dos fuentes) los pisa
 * `[data-layout="jungla"], .tpl-jungla` en `styles.css`, por eso acá no hay
 * `styleUrl` ni un solo color literal.
 */
@Component({
  selector: 'app-template-jungla',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-jungla.component.html',
  host: {
    // Los tokens van también en el host (no sólo en `html[data-layout]`) para que
    // la miniatura viva de /admin/config/diseno se vea con esta tipografía y esta
    // paleta aunque el diseño activo de la tienda sea otro. Sin `styleUrl`: el CSS
    // propio vive en `styles.css` por el presupuesto de `anyComponentStyle`.
    class: 'tpl-jungla block bg-brand-50 text-stone-800',
  },
})
export class TemplateJunglaComponent {
  readonly vm = input.required<CatalogView>();

  /**
   * Cómo se compra hoy. Son los dos caminos REALES de la tienda y son
   * excluyentes (lo decide el backend con `mercadoPagoAvailable`): no es una
   * promesa de marketing ni un lugar para inventar envíos o cuotas.
   */
  readonly compraLine = computed(() =>
    this.vm().settings().mercadoPagoAvailable
      ? 'Sumás las prendas al carrito y pagás online con Mercado Pago.'
      : 'Sumás las prendas al carrito y coordinamos la compra por WhatsApp.'
  );

  /**
   * Carril de "los más elegidos del campamento". La fuente real es
   * `bestSellers` (lo que el backend calcula con las ventas); si todavía no hay
   * ventas suficientes cae a las primeras prendas del catálogo filtrado, así el
   * carril nunca queda vacío cuando hay prendas. Con el catálogo vacío devuelve
   * la lista vacía y la sección entera no se dibuja.
   */
  readonly destacados = computed<Product[]>(() => {
    const best = this.vm().bestSellers();
    if (best.length) return best.slice(0, 12);
    return this.vm().visibleProducts().slice(0, 12);
  });

  /** Categorías reales del grupo "Público" (Bebé, Nena, Nene…). */
  readonly categorias = computed<ParamOption[]>(() => this.vm().publicoGroup()?.options ?? []);

  /**
   * Chip de filtro. El activo va verde lleno con texto blanco y el resto blanco
   * con borde de hoja. Se arma entero acá (y no combinando `.jungla-chip` con
   * clases de Tailwind en el template) porque `.jungla-chip` vive fuera de las
   * capas de Tailwind y le ganaría en cascada al `bg-brand-500`; además así el
   * template elige entre dos strings y nunca mete una barra `/` dentro de un
   * binding de clase, que rompe el parser con NG5002.
   */
  protected chipClass(active: boolean): string {
    const base = 'rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors ring-2';
    return active
      ? `${base} bg-brand-500 text-white ring-brand-500`
      : `${base} bg-white text-brand-700 ring-brand-200 hover:ring-brand-400`;
  }
}
