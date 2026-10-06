import {
  AfterViewInit,
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  input,
  signal,
} from '@angular/core';

export type RevealVariant =
  | 'up'
  | 'mask'
  | 'bounce'
  | 'blur'
  | 'left'
  | 'right'
  | 'zoom'
  | 'fold'
  | 'flip';

/**
 * Aparición al hacer scroll: el elemento empieza invisible y entra cuando llega
 * al viewport. Sin dependencias — `IntersectionObserver` + las clases `.reveal`,
 * `.reveal-mask`, `.reveal-bounce`, `.reveal-blur`, `.reveal-left`,
 * `.reveal-right` y `.reveal-zoom` definidas en `styles.css`. `fold` (se
 * despliega desde arriba como un papel doblado) y `flip` (se da vuelta como una
 * hoja) son las de Origami.
 *
 * `[delay]` sirve para el efecto escalonado: en un `@for` se pasa `i * 60`.
 * Con `prefers-reduced-motion` el CSS ya deja todo visible, así que acá no hace
 * falta ramificar.
 */
@Directive({
  selector: '[appReveal]',
  host: {
    '[class.reveal]': 'variant() === "up"',
    '[class.reveal-mask]': 'variant() === "mask"',
    '[class.reveal-bounce]': 'variant() === "bounce"',
    '[class.reveal-blur]': 'variant() === "blur"',
    '[class.reveal-left]': 'variant() === "left"',
    '[class.reveal-right]': 'variant() === "right"',
    '[class.reveal-zoom]': 'variant() === "zoom"',
    '[class.reveal-fold]': 'variant() === "fold"',
    '[class.reveal-flip]': 'variant() === "flip"',
    '[class.is-visible]': 'visible()',
    '[style.transition-delay.ms]': 'delay()',
  },
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  readonly variant = input<RevealVariant>('up');
  readonly delay = input(0);

  private readonly visible = signal(false);
  private observer: IntersectionObserver | null = null;

  ngAfterViewInit(): void {
    // El observer se crea fuera de Angular para que el scroll no dispare ciclos
    // de change detection; al revelar sí hay que volver adentro, porque
    // `visible()` está bindeado en el host y necesita que corra CD una vez.
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            this.observer?.unobserve(entry.target);
            this.zone.run(() => this.visible.set(true));
          }
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
      );
      this.observer.observe(this.el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
