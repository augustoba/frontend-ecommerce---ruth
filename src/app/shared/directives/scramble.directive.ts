import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, effect, inject, input } from '@angular/core';

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&/<>';

/**
 * Texto que se "descifra" (diseño Cifrado): arranca como letras al azar y se va
 * acomodando de izquierda a derecha hasta formar la palabra. Corre cuando el
 * elemento entra en pantalla y, con puntero fino, cada vez que se le pasa el
 * mouse por encima.
 *
 * Igual que `appTypewriter`, el texto llega por el input y no por el contenido
 * (el nombre de la tienda llega después del primer render) y queda completo en
 * `aria-label`. Los espacios no se mezclan, así las palabras conservan su
 * largo y el renglón no baila más de lo necesario.
 *
 * Un frame por paso, fuera de Angular. Con `prefers-reduced-motion` escribe el
 * texto final de una.
 */
@Directive({
  selector: '[appScramble]',
  host: { '[attr.aria-label]': 'appScramble()', '(pointerenter)': 'onEnter()' },
})
export class ScrambleDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  readonly appScramble = input.required<string>();

  private readonly reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  private observer: IntersectionObserver | null = null;
  private frame = 0;
  private visible = false;

  constructor() {
    effect(() => {
      const text = this.appScramble();
      if (this.visible) this.run(text);
      else this.el.nativeElement.textContent = text;
    });
  }

  ngAfterViewInit(): void {
    if (this.reduced || typeof IntersectionObserver === 'undefined') {
      this.visible = true;
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          this.observer?.disconnect();
          this.visible = true;
          this.run(this.appScramble());
        },
        { threshold: 0.2 }
      );
      this.observer.observe(this.el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.frame) cancelAnimationFrame(this.frame);
  }

  protected onEnter(): void {
    if (this.fine && this.visible && !this.frame) this.run(this.appScramble());
  }

  private run(text: string): void {
    const host: HTMLElement = this.el.nativeElement;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    if (this.reduced) {
      host.textContent = text;
      return;
    }
    const letters = Array.from(text);
    // Cuántos frames tarda en fijarse cada letra: las de la derecha, más.
    const perLetter = Math.max(1, Math.min(3, Math.round(36 / Math.max(1, letters.length))));
    let tick = 0;
    const step = (): void => {
      tick++;
      const fixed = Math.floor(tick / perLetter);
      host.textContent = letters
        .map((ch, i) => (i < fixed || ch === ' ' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
        .join('');
      this.frame = fixed < letters.length ? requestAnimationFrame(step) : 0;
    };
    this.zone.runOutsideAngular(() => {
      this.frame = requestAnimationFrame(step);
    });
  }
}
