import { Component, inject } from '@angular/core';
import { SettingsService } from '../../../core/services/settings.service';

/**
 * Botón flotante de WhatsApp anclado abajo a la derecha, visible en todas las
 * páginas públicas (no en el panel de admin — ver `app.component.html`). Va al
 * chat general de la tienda, sin mensaje precargado (para eso está el
 * WhatsApp del resumen del pedido, ver `WhatsappService`).
 */
@Component({
  selector: 'app-whatsapp-float',
  template: `
    <a
      [href]="whatsappUrl()"
      target="_blank"
      rel="noopener"
      aria-label="Escribinos por WhatsApp"
      class="fixed bottom-5 right-5 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-lg shadow-black/20 hover:scale-105 transition-transform"
    >
      <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M7 17.5 L7.9 13.9 A6 6 0 1 1 10.7 17.1 Z"
          fill="white"
        />
        <circle cx="9.3" cy="11.5" r="1" fill="#25D366" />
        <circle cx="12" cy="11.5" r="1" fill="#25D366" />
        <circle cx="14.7" cy="11.5" r="1" fill="#25D366" />
      </svg>
    </a>
  `,
})
export class WhatsappFloatComponent {
  private readonly settingsService = inject(SettingsService);
  readonly whatsappUrl = this.settingsService.whatsappUrl;
}
