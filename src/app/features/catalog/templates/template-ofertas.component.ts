import { Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogView } from '../catalog-view';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Ofertas": la home como góndola de supermercado. Es el único que arranca
 * por la promo y no por la marca —arriba de todo la barra con los descuentos
 * vigentes reales, sin hero grande—, la información apilada, los filtros en
 * columna al costado, la grilla apretada de 4 y el precio enorme (lo pinta la
 * tarjeta `variant="oferta"`). Tipografía condensada de cartel, rojo y cajas
 * duras; la paleta, las fuentes y los radios los pisa `[data-layout="ofertas"]`
 * en `styles.css`, así que también cambian el header y el footer de la tienda.
 */
@Component({
  selector: 'app-template-ofertas',
  imports: [
    NgTemplateOutlet,
    FormsModule,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-ofertas.component.html',
  host: {
    // Igual que Editorial y Pop: las variables del diseño van también en el host
    // (no sólo en `html[data-layout]`) para que la miniatura viva de
    // /admin/config/diseno se vea con esta tipografía y este rojo aunque el
    // diseño activo de la tienda sea otro.
    class: 'tpl-ofertas block bg-brand-50 text-stone-800',
  },
})
export class TemplateOfertasComponent {
  readonly vm = input.required<CatalogView>();

  /**
   * Cuántos filtros hay puestos, para el contador del `<summary>` de mobile.
   *
   * Es sólo el desglose en número de lo que el contenedor ya expone con
   * `hasActiveFilters()`: la plantilla no tiene estado propio ni sabe filtrar,
   * únicamente cuenta para poder mostrarlo.
   */
  readonly activeFilterCount = computed(() => {
    const v = this.vm();
    let count = 0;
    if (v.searchTerm()) count++;
    if (v.selectedSize() !== 'todos') count++;
    if (v.minPrice() !== null) count++;
    if (v.maxPrice() !== null) count++;
    // El "Público" se dibuja como un select más, así que cuenta igual que el resto
    // de las parametrías (y si el backend no devolvió categorías, no hay nada que contar).
    const groups = [v.publicoGroup(), ...v.selectGroups()];
    for (const group of groups) {
      if (group && v.paramValue(group.id)) count++;
    }
    return count;
  });
}
