import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MotionTemplateBase } from './motion-template.base';
import { PromoLine } from '../catalog-view';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/** Una pantalla del visor: una foto del carrusel, una promo real o el logo. */
type Historia =
  | { kind: 'foto'; image: string; alt: string }
  | { kind: 'promo'; promo: PromoLine }
  | { kind: 'tienda' };

/**
 * Diseño "Historias": pensado para el pulgar. El hero es un visor de historias
 * como el de las redes: las fotos del carrusel y las promos vigentes pasan solas,
 * con las barritas de progreso arriba; se toca a la derecha para avanzar, a la
 * izquierda para volver y se mantiene apretado para pausar. Las categorías son
 * círculos con aro, lo más vendido es un carrete que encastra y los filtros
 * salen en una hoja desde abajo que se puede arrastrar para cerrar.
 *
 * El tiempo de cada historia lo marca la animación CSS de la barrita
 * (`animationend` pide la siguiente): no hay ningún `setInterval`. Con
 * `prefers-reduced-motion` las historias no avanzan solas, sólo al tocar.
 */
@Component({
  selector: 'app-template-historias',
  imports: [
    FormsModule,
    ProductCardComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-historias.component.html',
  host: { class: 'tpl-historias block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateHistoriasComponent extends MotionTemplateBase {
  /**
   * Las historias: primero las fotos del carrusel, después las promos reales.
   * Si el local no cargó ni fotos ni promos, queda una sola con el logo.
   */
  readonly historias = computed<Historia[]>(() => {
    const v = this.vm();
    const fotos: Historia[] = v.heroSlides().map((s) => ({ kind: 'foto', image: s.imageUrl, alt: s.alt }));
    const promos: Historia[] = v.promos().map((p) => ({ kind: 'promo', promo: p }));
    const todas = [...fotos, ...promos];
    return todas.length ? todas : [{ kind: 'tienda' }];
  });

  private readonly indice = signal(0);
  protected readonly pausada = signal(false);

  /** Índice actual, siempre dentro de rango aunque cambie la cantidad de historias. */
  readonly actual = computed(() => {
    const n = this.historias().length;
    return ((this.indice() % n) + n) % n;
  });

  protected siguiente(): void {
    this.indice.update((i) => i + 1);
  }

  protected anterior(): void {
    this.indice.update((i) => i - 1);
  }

  /** Cuántos filtros de la hoja están puestos (el buscador y el orden van afuera). */
  readonly filtrosPuestos = computed(() => {
    const v = this.vm();
    let n = 0;
    if (v.selectedSize() !== 'todos') n++;
    if (v.minPrice() !== null) n++;
    if (v.maxPrice() !== null) n++;
    for (const group of v.selectGroups()) if (v.paramValue(group.id)) n++;
    return n;
  });

  // --- Arrastre de la hoja de filtros ---
  private dragStart: number | null = null;

  protected onSheetDown(event: PointerEvent): void {
    this.dragStart = event.clientY;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected onSheetMove(event: PointerEvent, sheet: HTMLDialogElement): void {
    if (this.dragStart === null) return;
    const dy = Math.max(0, event.clientY - this.dragStart);
    sheet.classList.add('is-dragging');
    sheet.style.setProperty('--drag', `${dy}px`);
  }

  /** Soltada lejos, la hoja se cierra; si no, vuelve a su lugar. */
  protected onSheetUp(event: PointerEvent, sheet: HTMLDialogElement): void {
    if (this.dragStart === null) return;
    const dy = event.clientY - this.dragStart;
    this.dragStart = null;
    sheet.classList.remove('is-dragging');
    sheet.style.setProperty('--drag', '0px');
    if (dy > 90) sheet.close();
  }
}
