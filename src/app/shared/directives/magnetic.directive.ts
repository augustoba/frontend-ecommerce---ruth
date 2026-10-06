import { Directive, ElementRef, inject, input } from '@angular/core';

/**
 * Botón "magnético": mientras el puntero está encima, el elemento se corre un
 * poco hacia él, y al salir vuelve a su lugar. El corrimiento va en `--tx`/`--ty`
 * y el `transform` + la transición los pone `.magnetic` en `styles.css` (la
 * vuelta es una transición, así que se puede interrumpir a mitad de camino).
 *
 * Igual que `appTilt`: sólo con puntero fino y sin `prefers-reduced-motion`.
 */
@Directive({
  selector: '[appMagnetic]',
  host: {
    class: 'magnetic',
    '(pointermove)': 'onMove($event)',
    '(pointerleave)': 'reset()',
  },
})
export class MagneticDirective {
  private readonly el = inject(ElementRef<HTMLElement>);

  /** Qué fracción de la distancia al centro se corre. 0.3 se nota sin exagerar. */
  readonly appMagnetic = input(0.3);

  private readonly enabled =
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  protected onMove(event: PointerEvent): void {
    if (!this.enabled) return;
    const host: HTMLElement = this.el.nativeElement;
    const rect = host.getBoundingClientRect();
    const strength = this.appMagnetic();
    host.classList.add('is-pulled');
    host.style.setProperty('--tx', `${((event.clientX - rect.left - rect.width / 2) * strength).toFixed(1)}px`);
    host.style.setProperty('--ty', `${((event.clientY - rect.top - rect.height / 2) * strength).toFixed(1)}px`);
  }

  protected reset(): void {
    const host: HTMLElement = this.el.nativeElement;
    host.classList.remove('is-pulled');
    host.style.setProperty('--tx', '0px');
    host.style.setProperty('--ty', '0px');
  }
}
