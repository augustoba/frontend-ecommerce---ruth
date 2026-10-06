import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/**
 * Diseño "Tablero": un cartel de aeropuerto. La pieza central es un tablero de
 * paletas: cada letra está en su casillero y, cuando cambia la promo, todas giran
 * (una atrás de la otra) hasta mostrar el texto nuevo. Sin promos cargadas, el
 * tablero muestra el nombre de la tienda.
 *
 * `filas()` parte el texto en renglones de `COLS` letras sin cortar palabras. Cada
 * letra alterna la clase `is-b` cuando cambia la promo (ver `promoPar`), que es
 * lo que vuelve a disparar el giro; `--d` es su orden, para el retraso escalonado. El tablero es
 * decorativo (`aria-hidden`): el texto real va al lado, en un párrafo normal.
 */
@Component({
  selector: 'app-template-tablero',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-tablero.component.html',
  host: { class: 'tpl-tablero block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateTableroComponent extends MotionTemplateBase {
  private static readonly COLS = 16;
  private static readonly ROWS = 3;

  /** Lo que muestra el tablero: la promo actual o, si no hay, el nombre de la tienda. */
  readonly cartel = computed(() => this.promoActual()?.text ?? this.vm().storeName());

  /** El texto en renglones de `COLS` casilleros, en mayúsculas y rellenos con espacios. */
  readonly filas = computed<string[][]>(() => {
    const cols = TemplateTableroComponent.COLS;
    const rows: string[] = [];
    let line = '';
    for (const word of this.cartel().toUpperCase().split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (next.length <= cols) {
        line = next;
      } else {
        if (line) rows.push(line);
        line = word.slice(0, cols);
      }
    }
    if (line) rows.push(line);
    while (rows.length < TemplateTableroComponent.ROWS) rows.push('');
    return rows.slice(0, TemplateTableroComponent.ROWS).map((row) => Array.from(row.padEnd(cols, ' ')));
  });

  protected readonly cols = TemplateTableroComponent.COLS;
}
