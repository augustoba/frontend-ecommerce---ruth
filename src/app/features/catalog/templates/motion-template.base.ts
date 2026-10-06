import { Directive, computed, input } from '@angular/core';
import { CatalogView } from '../catalog-view';
import { ParamOption } from '../../../core/models/param.model';
import { Product, productHasParam } from '../../../core/models/product.model';

/**
 * Base de los nueve diseños "de movimiento" (Pasarela, Baraja, Líquido,
 * Kinético, Órbita, Estela, Origami, Historias y Portal).
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
    this.vm().settings().mercadoPagoAvailable
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
