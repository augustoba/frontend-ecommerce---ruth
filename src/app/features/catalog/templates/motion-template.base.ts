import { Directive, computed, input, signal } from '@angular/core';
import { CatalogView, PromoLine } from '../catalog-view';
import { ParamOption } from '../../../core/models/param.model';
import { Product, productHasParam } from '../../../core/models/product.model';

/**
 * Base de los diseños "de movimiento" (las tres tandas: de Pasarela a Radar).
 *
 * Sólo junta los helpers de presentación que los nueve repiten tal cual —la
 * línea de compra, las categorías reales con su foto y su conteo—. El markup
 * NO se comparte: cada plantilla sigue siendo dueña de todo su HTML, que es la
 * regla del sistema de diseños. Igual que el resto de las plantillas, no inyecta
 * servicios: lee el `CatalogView` y nada más.
 */
@Directive()
export abstract class MotionTemplateBase {
  readonly vm = input.required<CatalogView>();

  /**
   * Cómo se compra hoy. Son los dos caminos REALES de la tienda y son
   * excluyentes (lo decide el backend con `mercadoPagoAvailable`).
   */
  readonly compraLine = computed(() =>
    !this.vm().settings().onlineSalesEnabled
      ? 'Mirá las prendas y consultanos por WhatsApp.'
      : this.vm().settings().mercadoPagoAvailable
        ? 'Sumás las prendas al carrito y pagás online con Mercado Pago.'
        : 'Sumás las prendas al carrito y coordinamos la compra por WhatsApp.'
  );

  /** Categorías reales del grupo "Público" (Bebé, Nena, Nene…). Vacío = la sección no se dibuja. */
  readonly categorias = computed<ParamOption[]>(() => this.vm().publicoGroup()?.options ?? []);

  /** Portada de la primera prenda de cada categoría, o `null` si quedó sin prendas. */
  readonly fotoDeCategoria = computed<Record<string, string | null>>(() => {
    const fotos: Record<string, string | null> = {};
    for (const option of this.categorias()) {
      fotos[option.id] = this.productsOf(option.id)[0]?.imageUrl ?? null;
    }
    return fotos;
  });

  /** Cuántas prendas tiene hoy cada categoría (el dato real del contador). */
  readonly totalDeCategoria = computed<Record<string, number>>(() => {
    const totales: Record<string, number> = {};
    for (const option of this.categorias()) {
      totales[option.id] = this.productsOf(option.id).length;
    }
    return totales;
  });

  /**
   * Las prendas de la pieza con movimiento de cada diseño (el desfile, el mazo,
   * el anillo). Son "Lo más vendido" cuando hay por lo menos cuatro; con menos
   * la pieza no llega a moverse, así que cae a las primeras del catálogo —que
   * con el orden por defecto son las más nuevas— y el título lo dice: nunca se
   * muestra como "más vendido" algo que no lo es. Con filtros puestos no hay
   * pieza (mismo criterio que el resto de los diseños).
   */
  readonly destacadas = computed<{ titulo: string; items: Product[] }>(() => {
    const v = this.vm();
    if (v.hasActiveFilters()) return { titulo: '', items: [] };
    const vendidas = v.bestSellers();
    if (vendidas.length >= 4) return { titulo: 'Lo más vendido', items: vendidas.slice(0, 10) };
    return {
      titulo: v.sortBy() === 'novedades' ? 'Novedades' : 'Destacadas',
      items: v.visibleProducts().slice(0, 8),
    };
  });

  /** Una foto real para piezas grandes: la primera del carrusel o, si no hay, la de una prenda. */
  readonly fotoPrincipal = computed<string | null>(() => {
    const v = this.vm();
    return v.heroSlides()[0]?.imageUrl ?? v.filteredProducts()[0]?.imageUrl ?? null;
  });

  // --- Banner de promos que rota ---
  // Lo usan los diseños que muestran una promo por vez. `promoGiro` no se
  // reinicia: cuenta los cambios y el índice sale con módulo, así sigue andando
  // aunque cambie la cantidad de promos. El tiempo entre una y otra lo marca la
  // animación CSS de `.promo-timer` (`animationend` llama a `promoSiguiente`):
  // no hay `setInterval`, y con `prefers-reduced-motion` no avanza sola.
  private readonly promoGiro = signal(0);

  /**
   * Si el giro actual es impar. La plantilla lo pone como clase `is-b` en la
   * barrita y en la promo: el CSS tiene cada animación dos veces, con dos
   * nombres (`x` y `x-b`), y cambiar de nombre es lo que la vuelve a disparar.
   * Así no hace falta destruir y recrear el nodo en cada cambio.
   */
  readonly promoPar = computed(() => this.promoGiro() % 2 !== 0);

  readonly promoIdx = computed(() => {
    const n = this.vm().promos().length;
    return n ? ((this.promoGiro() % n) + n) % n : 0;
  });

  readonly promoActual = computed<PromoLine | null>(() => this.vm().promos()[this.promoIdx()] ?? null);

  protected promoSiguiente(): void {
    this.promoGiro.update((g) => g + 1);
  }

  /** Los textos de las promos, dos veces: `.anim-marquee` corre exactamente 50%. */
  readonly promoLoop = computed<string[]>(() => {
    const textos = this.vm().promos().map((p) => p.text);
    return [...textos, ...textos];
  });

  protected productsOf(optionId: string): Product[] {
    return this.vm().filteredProducts().filter((p) => productHasParam(p, 'grp-publico', optionId));
  }

  /** Filtrar por esa categoría y bajar a la grilla: lo hace el contenedor, no la plantilla. */
  protected elegirCategoria(optionId: string): void {
    const group = this.vm().publicoGroup();
    if (!group) return;
    this.vm().setParam(group.id, optionId);
    this.vm().scrollToCatalog();
  }

  /** "01", "02"… para los números decorativos. */
  protected pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }
}
