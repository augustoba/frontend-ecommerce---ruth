import { Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogView } from '../catalog-view';
import { Product } from '../../../core/models/product.model';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Fichero": una ficha técnica antes que una vidriera. Papel blanco,
 * azul tinta, todo en monoespaciada y esquinas rectas (los radios los pisa
 * `[data-layout="fichero"]` en `styles.css`), y el catálogo en FILAS en vez de
 * grilla. Es la única plantilla que muestra la descripción y los talles de cada
 * prenda directamente en la home: la lista se lee como una planilla de taller,
 * no como una góndola.
 */
@Component({
  selector: 'app-template-fichero',
  imports: [
    FormsModule,
    RouterLink,
    CurrencyPipe,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-fichero.component.html',
  host: {
    // Idem el resto de las plantillas: las variables del diseño van también en
    // el host para que la miniatura viva de /admin/config/diseno se vea con la
    // monoespaciada y la paleta de Fichero aunque el diseño activo sea otro.
    class: 'tpl-fichero block bg-brand-50 text-stone-800',
  },
})
export class TemplateFicheroComponent {
  readonly vm = input.required<CatalogView>();

  /**
   * La prenda que va en grande arriba del catálogo. Los "más vendidos" son la
   * elección natural, pero en la miniatura del admin esa lista viene vacía
   * (no se piden los más vendidos para el preview): en ese caso cae a la
   * primera prenda visible, y si tampoco hay nada, a `null` para que la sección
   * entera no se dibuje.
   *
   * Con filtros puestos se destaca la primera prenda que coincide con lo que el
   * cliente filtró y no la más vendida: si no, quedaría arriba una prenda que no
   * tiene nada que ver con la búsqueda.
   */
  protected readonly featured = computed<Product | null>(() => {
    const v = this.vm();
    const source = v.hasActiveFilters() ? v.visibleProducts() : v.bestSellers();
    return source[0] ?? v.visibleProducts()[0] ?? null;
  });
}
