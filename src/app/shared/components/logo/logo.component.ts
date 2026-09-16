import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { SettingsService } from '../../../core/services/settings.service';
import { CldImagePipe } from '../../pipes/cld-image.pipe';

/**
 * Logo del negocio, con la forma que haya elegido el dueño de la tienda
 * (`SiteSettings.logoShape`: circle/square/rectangle) — centraliza el
 * recorte para no repetirlo en header, footer y la portada de Clásico.
 * `size` es el alto en px; el ancho depende de la forma (cuadrado en
 * circle/square, más ancho y sin recortar en rectangle).
 */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CldImagePipe],
  host: { style: 'display: contents' },
  template: `
    <img
      [src]="src() | cldImg: size() * 2"
      [alt]="alt()"
      [class]="classes()"
      [style.height.px]="size()"
      [style.width.px]="shape() === 'rectangle' ? null : size()"
      [style.max-width.px]="shape() === 'rectangle' ? size() * 3 : null"
    />
  `,
})
export class LogoComponent {
  private readonly settingsService = inject(SettingsService);

  readonly src = input.required<string>();
  readonly alt = input<string>('');
  /** Alto en px (el ancho se calcula según la forma). */
  readonly size = input<number>(44);
  /** Clases extra (ring, sombra, etc.) que se agregan a las de la forma. */
  readonly extraClass = input<string>('');

  readonly shape = computed(() => this.settingsService.settings().logoShape || 'circle');

  readonly classes = computed(() => {
    const base =
      this.shape() === 'square'
        ? 'rounded-lg object-cover bg-white shrink-0'
        : this.shape() === 'rectangle'
          ? 'rounded-md object-contain bg-white shrink-0'
          : 'rounded-full object-cover bg-white shrink-0';
    return this.extraClass() ? `${base} ${this.extraClass()}` : base;
  });
}
