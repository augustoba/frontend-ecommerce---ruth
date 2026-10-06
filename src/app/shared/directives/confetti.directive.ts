import { Directive, ElementRef, inject, input } from '@angular/core';

const COLORS = ['#ff4d8d', '#ffd23f', '#00c2a8', '#5b6cff', '#ff8a3d'];

/**
 * Papelitos al tocar (diseño Confeti): cada clic sobre el elemento suelta una
 * ráfaga de papelitos desde donde se tocó.
 *
 * Los papelitos son `<i>` sueltos en `document.body` (posición fija, sin
 * interacción) animados con WAAPI (`element.animate`): sólo `transform` y
 * `opacity`, y cada uno se saca del DOM cuando termina. No frena ni demora el
 * clic: si el elemento es un link o un botón, hace lo suyo igual.
 *
 * Es deleite puro, así que con `prefers-reduced-motion` no hace nada.
 */
@Directive({
  selector: '[appConfetti]',
  host: { '(click)': 'burst($event)' },
})
export class ConfettiDirective {
  private readonly el = inject(ElementRef<HTMLElement>);

  /** Cuántos papelitos por ráfaga. */
  readonly pieces = input(16);

  private readonly reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  protected burst(event: MouseEvent): void {
    if (this.reduced || typeof document.body.animate !== 'function') return;
    // Un clic de teclado llega sin coordenadas: la ráfaga sale del centro.
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;
    const count = this.pieces();

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('i');
      const size = 6 + Math.random() * 6;
      piece.setAttribute('aria-hidden', 'true');
      piece.style.cssText =
        `position:fixed;left:${x}px;top:${y}px;z-index:60;pointer-events:none;` +
        `width:${size}px;height:${size * (Math.random() > 0.5 ? 1 : 0.45)}px;` +
        `background:${COLORS[i % COLORS.length]};border-radius:${Math.random() > 0.6 ? '50%' : '1px'};`;
      document.body.appendChild(piece);

      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const reach = 60 + Math.random() * 90;
      const dx = Math.cos(angle) * reach;
      const dy = Math.sin(angle) * reach - 40;
      const spin = (Math.random() - 0.5) * 720;
      piece
        .animate(
          [
            { transform: 'translate(-50%, -50%) rotate(0deg)', opacity: 1 },
            { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${spin * 0.6}deg)`, opacity: 1, offset: 0.6 },
            { transform: `translate(calc(-50% + ${dx * 1.15}px), calc(-50% + ${dy + 70}px)) rotate(${spin}deg)`, opacity: 0 },
          ],
          { duration: 750 + Math.random() * 350, easing: 'cubic-bezier(.23, 1, .32, 1)' }
        )
        .finished.then(
          () => piece.remove(),
          () => piece.remove()
        );
    }
  }
}
