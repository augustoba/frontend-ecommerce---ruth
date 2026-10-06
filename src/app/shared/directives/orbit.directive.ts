import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject, input } from '@angular/core';

/**
 * Anillo 3D que gira (diseño Órbita): acomoda a los hijos directos del host en
 * círculo (`rotateY` + `translateZ`), lo hace girar solo, despacio, y deja
 * arrastrarlo con el dedo o el mouse, con inercia al soltar.
 *
 * Todo el movimiento se escribe directo en `style.transform` desde un
 * `requestAnimationFrame` fuera de Angular: no hay señales ni bindings, así que
 * girar no dispara change detection. El hijo que queda de frente recibe la clase
 * `is-front` (el CSS lo agranda); el resto del aspecto es de `.orbita-ring`.
 *
 * Se frena solo cuando el anillo sale de pantalla, y con
 * `prefers-reduced-motion` ni se engancha: el CSS lo deja como un riel plano que
 * se desliza (`.orbita-ring` sin `is-3d`).
 */
@Directive({
  selector: '[appOrbit]',
  host: { '(pointerdown)': 'onDown($event)' },
})
export class OrbitDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  /** Grados por segundo del giro automático. */
  readonly appOrbit = input(9);

  private readonly enabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private items: HTMLElement[] = [];
  private radius = 0;
  private angle = 0;
  private velocity = 0;
  private dragging = false;
  private dragged = 0;
  private lastX = 0;
  private lastTime = 0;
  private frame = 0;
  private visible = false;
  private front = -1;
  private io: IntersectionObserver | null = null;
  private mo: MutationObserver | null = null;

  ngAfterViewInit(): void {
    if (!this.enabled) return;
    const host: HTMLElement = this.el.nativeElement;
    this.zone.runOutsideAngular(() => {
      // En captura: tiene que frenar el clic ANTES de que llegue al link de la
      // prenda (`routerLink` escucha en el `<a>` de adentro).
      host.addEventListener('click', this.onClick, true);
      this.layout();
      // Los hijos cambian cuando llegan los productos del backend.
      this.mo = new MutationObserver(() => this.layout());
      this.mo.observe(host, { childList: true });
      window.addEventListener('resize', this.onResize, { passive: true });
      window.addEventListener('pointermove', this.onMove, { passive: true });
      window.addEventListener('pointerup', this.onUp, { passive: true });
      window.addEventListener('pointercancel', this.onUp, { passive: true });
      this.io = new IntersectionObserver((entries) => {
        this.visible = entries.some((e) => e.isIntersecting);
        if (this.visible) this.start();
      });
      this.io.observe(host);
    });
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
    this.mo?.disconnect();
    this.el.nativeElement.removeEventListener('click', this.onClick, true);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('pointercancel', this.onUp);
    if (this.frame) cancelAnimationFrame(this.frame);
  }

  private readonly onResize = (): void => this.layout();

  /** Reparte a los hijos en el círculo. El radio sale del ancho real de cada uno. */
  private layout(): void {
    const host: HTMLElement = this.el.nativeElement;
    this.items = Array.from(host.children) as HTMLElement[];
    const n = this.items.length;
    if (n < 3) {
      // Con una o dos prendas no hay anillo que armar: queda el riel plano.
      host.classList.remove('is-3d');
      host.style.transform = '';
      for (const item of this.items) item.style.transform = '';
      return;
    }
    host.classList.add('is-3d');
    const width = this.items[0].offsetWidth || 200;
    this.radius = Math.round(width / 2 / Math.tan(Math.PI / n)) + 28;
    this.items.forEach((item, i) => {
      item.style.transform = `rotateY(${(360 / n) * i}deg) translateZ(${this.radius}px)`;
    });
    this.front = -1;
    this.paint();
  }

  private start(): void {
    if (this.frame) return;
    this.lastTime = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private readonly tick = (now: number): void => {
    this.frame = 0;
    const dt = Math.min(64, now - this.lastTime) / 1000;
    this.lastTime = now;
    if (!this.dragging) {
      // La inercia del arrastre se apaga sola y vuelve al giro de crucero.
      this.velocity += (-this.appOrbit() - this.velocity) * Math.min(1, dt * 1.6);
      this.angle += this.velocity * dt;
      this.paint();
    }
    if (this.visible) this.frame = requestAnimationFrame(this.tick);
  };

  private paint(): void {
    const n = this.items.length;
    if (n < 3) return;
    const host: HTMLElement = this.el.nativeElement;
    host.style.transform = `translateZ(${-this.radius}px) rotateY(${this.angle.toFixed(2)}deg)`;
    const step = 360 / n;
    const front = ((Math.round(-this.angle / step) % n) + n) % n;
    if (front === this.front) return;
    this.items[this.front]?.classList.remove('is-front');
    this.items[front]?.classList.add('is-front');
    this.front = front;
  }

  protected onDown(event: PointerEvent): void {
    if (!this.enabled || this.items.length < 3) return;
    this.dragging = true;
    this.dragged = 0;
    this.lastX = event.clientX;
    this.velocity = 0;
  }

  private readonly onMove = (event: PointerEvent): void => {
    if (!this.dragging) return;
    const dx = event.clientX - this.lastX;
    this.lastX = event.clientX;
    this.dragged += Math.abs(dx);
    const degrees = (dx / Math.max(1, this.radius)) * 57.3;
    this.angle += degrees;
    // Velocidad en grados/seg, suavizada, para la inercia al soltar.
    this.velocity = this.velocity * 0.7 + degrees * 60 * 0.3;
    this.paint();
  };

  private readonly onUp = (): void => {
    this.dragging = false;
  };

  /** Si hubo arrastre, el clic no navega a la prenda: sólo se estaba girando. */
  private readonly onClick = (event: MouseEvent): void => {
    if (this.dragged > 6) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.dragged = 0;
  };
}
