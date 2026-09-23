import { Component, computed, inject, signal } from '@angular/core';
import { SettingsService } from '../../../core/services/settings.service';
import { CldImagePipe } from '../../pipes/cld-image.pipe';

const DISMISSED_KEY = 'promoBannerDismissed';

/**
 * Banner promocional (popup) que se muestra una vez por pestaña al entrar al
 * sitio, si el dueño lo activó y cargó una imagen (ver `admin-config-section`,
 * sección "Sobre nosotros"). Se cierra con la X o tocando afuera, y no vuelve
 * a aparecer en esta pestaña hasta que se recargue desde cero (sessionStorage
 * — es sólo una comodidad de la visita, no hace falta que sea más persistente).
 */
@Component({
  selector: 'app-promo-banner',
  imports: [CldImagePipe],
  template: `
    @if (visible()) {
      <div
        class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        (click)="dismiss()"
      >
        <div class="relative max-w-md w-full" (click)="$event.stopPropagation()">
          <button
            type="button"
            (click)="dismiss()"
            aria-label="Cerrar"
            class="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-stone-600 font-bold shadow-lg flex items-center justify-center hover:bg-stone-100"
          >
            ✕
          </button>
          @if (link(); as href) {
            <a [href]="href">
              <img [src]="image()! | cldImg: 800" alt="Promoción" class="w-full rounded-2xl shadow-2xl" />
            </a>
          } @else {
            <img [src]="image()! | cldImg: 800" alt="Promoción" class="w-full rounded-2xl shadow-2xl" />
          }
        </div>
      </div>
    }
  `,
})
export class PromoBannerComponent {
  private readonly settingsService = inject(SettingsService);

  private readonly dismissed = signal(this.wasDismissed());
  readonly image = computed(() => this.settingsService.settings().promoBannerImage);
  readonly link = computed(() => this.settingsService.settings().promoBannerLink);

  readonly visible = computed(
    () => this.settingsService.settings().promoBannerEnabled && !!this.image() && !this.dismissed()
  );

  dismiss(): void {
    this.dismissed.set(true);
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // localStorage/sessionStorage bloqueado (navegación privada, etc.) — no rompe nada.
    }
  }

  private wasDismissed(): boolean {
    try {
      return sessionStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  }
}
