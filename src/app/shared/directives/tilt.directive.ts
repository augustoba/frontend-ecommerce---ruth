import { Directive, ElementRef, inject, input } from '@angular/core';

/**
 * Inclinación 3D que sigue al puntero: la tarjeta se mueve con el mouse y un
 * brillo la recorre (lo que hacen las tiendas modernas en las fichas y en las
 * piezas de categoría).
 *
 * Sin dependencias y sin ciclos de detección: la rotación y la posición del
 * puntero se escriben como variables CSS (`--rx`, `--ry`, `--mx`, `--my`) y el
 * CSS global (`.tilt-3d` y `.tilt-shine`, en `styles.css`) hace el `transform`
 * y el degradado. Va con `runOutsideAngular` implícito: los listeners del host no
 * tocan ninguna señal, así que no disparan change detection ni un binding.
 *
 * Se apaga solo en pantallas táctiles (no hay puntero que seguir) y con
 * `prefers-reduced-motion: reduce`.
 */
@Directive({
  selector: '[appTilt]',
  host: {
    class: 'tilt-3d',
    '(pointermove)': 'onMove($event)',
    '(pointerleave)': 'reset()',
  },
})
export class TiltDirective {
  private readonly el = inject(ElementRef<HTMLElement>);

  /** Grados máximos de inclinación. 8 se nota sin marear; 4 es más sobrio. */
  readonly appTilt = input(8);

  /** Se evalúa una sola vez: si el dispositivo no tiene puntero fino, no se engancha nada. */
  private readonly enabled =
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  protected onMove(event: PointerEvent): void {
    if (!this.enabled) return;
    const host = this.el.nativeElement;
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    // 0..1 medido desde la esquina; -1..1 desde el centro para la rotación.
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const max = this.appTilt();

    host.classList.add('is-tilting');
    host.style.setProperty('--ry', `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
    host.style.setProperty('--rx', `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
    host.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    host.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  }

  protected reset(): void {
    const host = this.el.nativeElement;
    host.classList.remove('is-tilting');
    host.style.setProperty('--rx', '0deg');
    host.style.setProperty('--ry', '0deg');
  }
}
