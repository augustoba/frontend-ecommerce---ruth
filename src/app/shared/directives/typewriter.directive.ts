import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, effect, inject, input } from '@angular/core';

/**
 * Texto que se escribe solo (diseño Teletipo): cuando el elemento entra en
 * pantalla, el texto aparece letra por letra, como en una máquina de escribir.
 *
 * El texto llega por el input (`[appTypewriter]="v.storeName()"`) y no por el
 * contenido, a propósito: el nombre de la tienda llega del backend después del
 * primer render, y así la directiva se entera del cambio y vuelve a escribir.
 * El texto completo queda siempre en `aria-label`, así un lector de pantalla no
 * lee las letras de a una.
 *
 * Cada letra sale con un `setTimeout` corto (no hace falta un frame por letra) y
 * fuera de Angular. Con `prefers-reduced-motion`, o sin
 * `IntersectionObserver`, el texto se escribe entero de una.
 */
@Directive({
  selector: '[appTypewriter]',
  host: { class: 'typewriter', '[attr.aria-label]': 'appTypewriter()' },
})
export class TypewriterDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  readonly appTypewriter = input.required<string>();
  /** Milisegundos por letra. */
  readonly speed = input(55);

  private readonly reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private observer: IntersectionObserver | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private visible = false;

  constructor() {
    // Si el texto cambia (llegó el nombre real), se vuelve a escribir.
    effect(() => {
      const text = this.appTypewriter();
      if (this.visible) this.type(text);
    });
  }

  ngAfterViewInit(): void {
    if (this.reduced || typeof IntersectionObserver === 'undefined') {
      this.visible = true;
      this.el.nativeElement.textContent = this.appTypewriter();
      this.el.nativeElement.classList.add('is-typed');
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          this.observer?.disconnect();
          this.visible = true;
          this.type(this.appTypewriter());
        },
        { threshold: 0.2 }
      );
      this.observer.observe(this.el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.timer) clearTimeout(this.timer);
  }

  private type(text: string): void {
    if (this.timer) clearTimeout(this.timer);
    const host: HTMLElement = this.el.nativeElement;
    if (this.reduced) {
      host.textContent = text;
      host.classList.add('is-typed');
      return;
    }
    const letters = Array.from(text);
    let shown = 0;
    host.textContent = '';
    host.classList.remove('is-typed');
    const step = (): void => {
      shown++;
      host.textContent = letters.slice(0, shown).join('');
      if (shown < letters.length) {
        this.timer = setTimeout(step, this.speed());
      } else {
        this.timer = null;
        host.classList.add('is-typed');
      }
    };
    this.zone.runOutsideAngular(() => {
      this.timer = setTimeout(step, this.speed());
    });
  }
}
