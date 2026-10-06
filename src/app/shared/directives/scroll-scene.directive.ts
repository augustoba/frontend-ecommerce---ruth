import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject, input } from '@angular/core';

/**
 * Escena atada al scroll: escribe en el host `--s` (de 0 a 1) según por dónde va
 * el scroll respecto de una "escena", y el CSS hace el resto (`translate`,
 * `scale`, `clip-path`…). Es la base de los diseños que se mueven con el scroll
 * (Pasarela, Portal, Kinético, Baraja).
 *
 * Dos modos:
 *  - `pin` (default): la escena es más alta que la pantalla y adentro tiene algo
 *    `position: sticky`. `--s` va de 0 (el tope de la escena llegó arriba) a 1
 *    (la escena se terminó de recorrer).
 *  - `view`: `--s` va de 0 (la escena asoma por abajo) a 1 (se fue por arriba).
 *  - `exit`: `--s` va de 0 (el tope de la escena está arriba de todo) a 1 (la
 *    escena terminó de irse). Para lo que ya está en pantalla al cargar.
 *
 * `sceneOf` es el selector del ancestro que se mide; sin él se mide el host. Va
 * así, y no con la variable puesta en la escena, a propósito: una variable CSS
 * escrita en un contenedor grande recalcula estilos de todos sus hijos en cada
 * frame; puesta en el elemento que se mueve, sólo de ese.
 *
 * Mismo patrón que `appScrollProgress`: fuera de Angular y agrupado en un
 * `requestAnimationFrame`. Con `prefers-reduced-motion` no escribe nada y el CSS
 * se queda con su valor por defecto (`var(--s, 0)`).
 */
@Directive({ selector: '[appScrollScene]' })
export class ScrollSceneDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  readonly appScrollScene = input<'pin' | 'view' | 'exit' | ''>('pin');
  readonly sceneOf = input<string | null>(null);

  private scene: HTMLElement | null = null;
  private frame = 0;
  private last = -1;

  private readonly enabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  ngAfterViewInit(): void {
    if (!this.enabled) return;
    const host: HTMLElement = this.el.nativeElement;
    const selector = this.sceneOf();
    this.scene = selector ? host.closest<HTMLElement>(selector) : host;
    if (!this.scene) return;

    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll, { passive: true });
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
    if (!this.scene) return;
    const rect = this.scene.getBoundingClientRect();
    const viewport = window.innerHeight;
    let progress: number;
    const mode = this.appScrollScene();
    if (mode === 'view') {
      progress = (viewport - rect.top) / (viewport + rect.height);
    } else if (mode === 'exit') {
      progress = rect.height > 0 ? -rect.top / rect.height : 0;
    } else {
      const travel = rect.height - viewport;
      progress = travel > 0 ? -rect.top / travel : 0;
    }
    progress = Math.min(1, Math.max(0, progress));
    // Fuera de pantalla el valor queda clavado en 0 o 1: no se reescribe.
    if (Math.abs(progress - this.last) < 0.0005) return;
    this.last = progress;
    this.el.nativeElement.style.setProperty('--s', progress.toFixed(4));
  }
}
