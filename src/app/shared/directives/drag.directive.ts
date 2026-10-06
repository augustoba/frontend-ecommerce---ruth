import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';

/** Contador compartido: la última pieza que se agarra queda arriba de las demás. */
let topZ = 10;

/**
 * Pieza que se agarra y se mueve libremente (diseño Collage): sigue al dedo o al
 * mouse y se queda donde se la suelta.
 *
 * El corrimiento acumulado va en `--dx`/`--dy` y el `transform` lo arma
 * `.collage-piece` en `styles.css` (que además le suma su giro), así la
 * directiva no pisa la rotación de cada foto. Mientras se arrastra lleva
 * `is-dragging`. Todo corre fuera de Angular: mover una foto no dispara change
 * detection.
 *
 * Usa `setPointerCapture`, así el arrastre no se corta si el puntero sale de la
 * pieza. Con `touch-action: none` (lo pone el CSS) el dedo mueve la foto y no
 * la página; por eso las piezas van en una zona acotada y no en toda la home.
 */
@Directive({ selector: '[appDrag]' })
export class DragDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  private x = 0;
  private y = 0;
  private startX = 0;
  private startY = 0;
  private pointer: number | null = null;

  ngAfterViewInit(): void {
    const host: HTMLElement = this.el.nativeElement;
    this.zone.runOutsideAngular(() => {
      host.addEventListener('pointerdown', this.onDown);
      host.addEventListener('pointermove', this.onMove);
      host.addEventListener('pointerup', this.onUp);
      host.addEventListener('pointercancel', this.onUp);
    });
  }

  ngOnDestroy(): void {
    const host: HTMLElement = this.el.nativeElement;
    host.removeEventListener('pointerdown', this.onDown);
    host.removeEventListener('pointermove', this.onMove);
    host.removeEventListener('pointerup', this.onUp);
    host.removeEventListener('pointercancel', this.onUp);
  }

  private readonly onDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    const host: HTMLElement = this.el.nativeElement;
    this.pointer = event.pointerId;
    this.startX = event.clientX - this.x;
    this.startY = event.clientY - this.y;
    host.setPointerCapture(event.pointerId);
    host.classList.add('is-dragging');
    host.style.zIndex = String(++topZ);
  };

  private readonly onMove = (event: PointerEvent): void => {
    if (this.pointer !== event.pointerId) return;
    this.x = event.clientX - this.startX;
    this.y = event.clientY - this.startY;
    const host: HTMLElement = this.el.nativeElement;
    host.style.setProperty('--dx', `${this.x.toFixed(1)}px`);
    host.style.setProperty('--dy', `${this.y.toFixed(1)}px`);
  };

  private readonly onUp = (event: PointerEvent): void => {
    if (this.pointer !== event.pointerId) return;
    this.pointer = null;
    this.el.nativeElement.classList.remove('is-dragging');
  };
}
