import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';

/**
 * Estela que sigue al puntero (diseño Estela): los hijos marcados con
 * `data-trail` persiguen al mouse dentro del host, cada uno con un retraso
 * distinto (`data-trail="0.22"` es el más pegado, `"0.08"` el más perezoso), y
 * por eso se ven como una foto con su estela.
 *
 * Mientras el puntero está adentro el host lleva `is-trailing` (el CSS muestra
 * las piezas). El seguimiento es un lerp por frame escrito directo en
 * `style.transform`, fuera de Angular. Sólo se engancha con puntero fino y sin
 * `prefers-reduced-motion`: en táctil el diseño muestra la foto de otra forma.
 */
@Directive({ selector: '[appCursorTrail]' })
export class CursorTrailDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  private readonly enabled =
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private targetX = 0;
  private targetY = 0;
  private points: { x: number; y: number }[] = [];
  private frame = 0;
  private inside = false;

  ngAfterViewInit(): void {
    if (!this.enabled) return;
    const host: HTMLElement = this.el.nativeElement;
    this.zone.runOutsideAngular(() => {
      host.addEventListener('pointermove', this.onMove, { passive: true });
      host.addEventListener('pointerleave', this.onLeave, { passive: true });
    });
  }

  ngOnDestroy(): void {
    const host: HTMLElement = this.el.nativeElement;
    host.removeEventListener('pointermove', this.onMove);
    host.removeEventListener('pointerleave', this.onLeave);
    if (this.frame) cancelAnimationFrame(this.frame);
  }

  private pieces(): HTMLElement[] {
    return Array.from(this.el.nativeElement.querySelectorAll('[data-trail]')) as HTMLElement[];
  }

  private readonly onMove = (event: PointerEvent): void => {
    const host: HTMLElement = this.el.nativeElement;
    const rect = host.getBoundingClientRect();
    this.targetX = event.clientX - rect.left;
    this.targetY = event.clientY - rect.top;
    if (!this.inside) {
      // Al entrar, las piezas arrancan en el puntero: no cruzan toda la sección.
      this.inside = true;
      this.points = this.pieces().map(() => ({ x: this.targetX, y: this.targetY }));
      host.classList.add('is-trailing');
    }
    if (!this.frame) this.frame = requestAnimationFrame(this.tick);
  };

  private readonly onLeave = (): void => {
    this.inside = false;
    this.el.nativeElement.classList.remove('is-trailing');
  };

  private readonly tick = (): void => {
    this.frame = 0;
    const pieces = this.pieces();
    let moving = false;
    pieces.forEach((piece, i) => {
      const point = (this.points[i] ??= { x: this.targetX, y: this.targetY });
      const ease = Number(piece.dataset['trail']) || 0.15;
      point.x += (this.targetX - point.x) * ease;
      point.y += (this.targetY - point.y) * ease;
      if (Math.abs(this.targetX - point.x) + Math.abs(this.targetY - point.y) > 0.5) moving = true;
      piece.style.transform = `translate3d(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    });
    if (moving && this.inside) this.frame = requestAnimationFrame(this.tick);
  };
}
