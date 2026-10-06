import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';

/**
 * Reflector que sigue al puntero (diseño Foco): escribe en el host la posición
 * del mouse en píxeles (`--fx`, `--fy`) y le pone `is-lit` mientras está encima.
 * El CSS usa esas variables en una máscara radial (`.foco-color`), que es la que
 * deja ver la foto en color sólo donde apunta el reflector.
 *
 * Agrupado en un `requestAnimationFrame` y fuera de Angular. Sólo se engancha
 * con puntero fino y sin `prefers-reduced-motion`: en táctil el reflector se
 * pasea solo (una animación CSS sobre las mismas variables) y con movimiento
 * reducido la foto queda directamente en color.
 */
@Directive({ selector: '[appSpotlight]' })
export class SpotlightDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  private readonly enabled =
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private frame = 0;
  private x = 0;
  private y = 0;

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

  private readonly onMove = (event: PointerEvent): void => {
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.x = event.clientX - rect.left;
    this.y = event.clientY - rect.top;
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      const host: HTMLElement = this.el.nativeElement;
      host.classList.add('is-lit');
      host.style.setProperty('--fx', `${this.x.toFixed(0)}px`);
      host.style.setProperty('--fy', `${this.y.toFixed(0)}px`);
    });
  };

  private readonly onLeave = (): void => {
    this.el.nativeElement.classList.remove('is-lit');
  };
}
