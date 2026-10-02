import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';

/**
 * Barra de progreso de lectura: escribe en el host `--p` (de 0 a 1) según cuánto
 * se scrolleó la página.
 *
 * El CSS hace todo lo demás (`transform: scaleX(var(--p))` en `.nova-progress`),
 * así que no hay ningún binding ni señal de por medio: el scroll corre fuera de
 * Angular (`runOutsideAngular`) y agrupado en un `requestAnimationFrame`, que es
 * lo que evita el clásico "scroll que salta" cuando el listener hace trabajo de más.
 */
@Directive({ selector: '[appScrollProgress]' })
export class ScrollProgressDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  /** Frame pendiente del `requestAnimationFrame` (0 = no hay ninguno pedido). */
  private frame = 0;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll, { passive: true });
      // Al montar puede que la página ya esté scrolleada (recarga a mitad de camino).
      this.update();
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private readonly onScroll = (): void => {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.update();
    });
  };

  private update(): void {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
    this.el.nativeElement.style.setProperty('--p', progress.toFixed(4));
  }
}
