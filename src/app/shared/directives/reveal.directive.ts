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

export type RevealVariant = 'up' | 'mask' | 'bounce';

/**
 * Aparición al hacer scroll: el elemento empieza invisible y entra cuando llega
 * al viewport. Sin dependencias — `IntersectionObserver` + las clases `.reveal`,
 * `.reveal-mask` y `.reveal-bounce` definidas en `styles.css`.
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
