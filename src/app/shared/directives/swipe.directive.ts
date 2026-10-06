import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject, output } from '@angular/core';

/**
 * Carta que se descarta arrastrando (diseño Baraja): la carta sigue al dedo o al
 * mouse y, si se la suelta lejos o con envión, avisa con `(appSwipe)` hacia qué
 * lado se fue. Si no, vuelve sola a su lugar.
 *
 * Mientras se arrastra el host lleva `is-dragging` (el CSS apaga la transición
 * para que siga al dedo sin retraso) y el corrimiento va en `--dx`; al soltar se
 * saca la clase y la transición de `.baraja-card` la devuelve o la despide. El
 * gesto arranca recién cuando el movimiento es más horizontal que vertical, así
 * no le roba el scroll a la página en el celular.
 */
@Directive({
  selector: '[appSwipe]',
  host: { '(pointerdown)': 'onDown($event)' },
})
export class SwipeDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  /** -1 = se fue a la izquierda, 1 = a la derecha. */
  readonly appSwipe = output<-1 | 1>();

  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private dx = 0;
  private active = false;
  private locked = false;
  private moved = false;

  protected onDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startTime = performance.now();
    this.dx = 0;
    this.active = true;
    this.locked = false;
    this.moved = false;
    this.zone.runOutsideAngular(() => {
      window.addEventListener('pointermove', this.onMove, { passive: true });
      window.addEventListener('pointerup', this.onUp, { passive: true });
      window.addEventListener('pointercancel', this.onUp, { passive: true });
    });
  }

  ngAfterViewInit(): void {
    // En captura: tiene que frenar el clic ANTES de que llegue al link de la
    // prenda (`routerLink` escucha en el `<a>` de adentro).
    this.el.nativeElement.addEventListener('click', this.onClick, true);
  }

  ngOnDestroy(): void {
    this.detach();
    this.el.nativeElement.removeEventListener('click', this.onClick, true);
  }

  private detach(): void {
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('pointercancel', this.onUp);
  }

  private readonly onMove = (event: PointerEvent): void => {
    if (!this.active) return;
    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;
    if (!this.locked) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      // Más vertical que horizontal: es scroll, se suelta el gesto.
      if (Math.abs(dy) > Math.abs(dx)) {
        this.active = false;
        this.detach();
        return;
      }
      this.locked = true;
      this.el.nativeElement.classList.add('is-dragging');
    }
    this.dx = dx;
    this.moved = true;
    this.el.nativeElement.style.setProperty('--dx', `${dx.toFixed(1)}px`);
  };

  private readonly onUp = (): void => {
    this.detach();
    if (!this.active) return;
    this.active = false;
    const host: HTMLElement = this.el.nativeElement;
    host.classList.remove('is-dragging');
    host.style.setProperty('--dx', '0px');
    if (!this.moved) return;

    const elapsed = Math.max(1, performance.now() - this.startTime);
    const velocity = Math.abs(this.dx) / elapsed;
    // Lejos (un tercio de la carta) o con envión corto y rápido.
    if (Math.abs(this.dx) > host.offsetWidth * 0.33 || velocity > 0.55) {
      const direction = this.dx < 0 ? -1 : 1;
      this.zone.run(() => this.appSwipe.emit(direction));
    }
  };

  /** Un arrastre no es un clic: la carta no navega a la prenda. */
  private readonly onClick = (event: MouseEvent): void => {
    if (this.moved) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.moved = false;
  };
}
