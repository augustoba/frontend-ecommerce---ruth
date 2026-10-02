import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject, output } from '@angular/core';

/**
 * Scroll infinito de verdad, sin librerías: cuando el centinela entra en
 * pantalla, avisa. La plantilla lo usa para pedir la página siguiente
 * (`showMore()`), así el catálogo sigue cargando mientras el cliente baja en vez
 * de obligarlo a apretar "Ver más".
 *
 * El centinela sólo existe mientras queden prendas por mostrar (la plantilla lo
 * envuelve en `@if (v.hasMore())`), y por eso el ciclo se corta solo: cuando no
 * queda nada más, el elemento desaparece del DOM y el observer con él. Además
 * `hasMore()` ya viene en `false` en la miniatura del admin (`preview`), así que
 * las miniaturas no siguen cargando de fondo.
 */
@Directive({ selector: '[appAutoMore]' })
export class AutoMoreDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  /** Se emite cuando el centinela entra en pantalla. */
  readonly appAutoMore = output<void>();

  private observer: IntersectionObserver | null = null;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          this.zone.run(() => this.appAutoMore.emit());
          // Al entrar más prendas el centinela baja; si igual quedó a la vista
          // (pantallas muy altas), se vuelve a observar y sigue cargando.
          this.observer?.disconnect();
          requestAnimationFrame(() => this.observer?.observe(this.el.nativeElement));
        },
        // Un poco antes del borde: cuando el cliente llega, ya está cargado.
        { rootMargin: '400px 0px' }
      );
      this.observer.observe(this.el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
