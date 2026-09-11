import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  SiteSettings,
  LOGO_FALLBACK,
  WHATSAPP_INTRO_DEFAULT,
  WHATSAPP_CLOSING_DEFAULT,
} from '../../../core/services/settings.service';
import { applyWhatsappTokens } from '../../../core/services/whatsapp.service';
import { CldImagePipe } from '../../pipes/cld-image.pipe';

/** Qué parte de la tienda resaltar en la previsualización. */
export type PreviewFocus = 'header' | 'about' | 'social' | 'whatsapp';

/**
 * Previsualización "en chico" de cómo se ven en la tienda los datos del sitio
 * (nombre, WhatsApp, "sobre nosotros", redes). No monta los componentes reales
 * del storefront: es una maqueta con las mismas clases/colores que se actualiza
 * en vivo con lo que se está tipeando en el form de configuración.
 */
@Component({
  selector: 'app-site-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CldImagePipe],
  templateUrl: './site-preview.component.html',
})
export class SitePreviewComponent {
  /** Valores actuales del borrador que se está editando. */
  readonly settings = input.required<SiteSettings>();
  /** Secciones a mostrar destacadas (el resto se ve atenuado). */
  readonly focus = input<PreviewFocus[]>([]);

  readonly storeName = computed(() => this.settings().storeName?.trim() || 'Nombre de la tienda');
  readonly logoSrc = computed(() => this.settings().logoUrl || LOGO_FALLBACK);
  readonly aboutText = computed(
    () => this.settings().aboutText?.trim() || 'Todavía no cargaste el texto de "sobre nosotros".'
  );
  readonly instagram = computed(() => this.settings().instagram?.trim().replace(/^@/, '') || null);
  readonly instagramUrl = computed(() =>
    this.instagram() ? `https://instagram.com/${this.instagram()}` : null
  );
  readonly facebookUrl = computed(() => this.settings().facebookUrl?.trim() || null);
  readonly whatsappNumber = computed(() => this.settings().whatsappNumber?.trim() || '');
  readonly whatsappValid = computed(() => /^\d{8,15}$/.test(this.whatsappNumber()));
  readonly whatsappLink = computed(() => `https://wa.me/${this.whatsappNumber()}`);

  /** Mensaje de pedido de ejemplo, tal como sale en WhatsApp (versión corta). */
  readonly whatsappMessage = computed(() => {
    const name = this.storeName();
    const intro = applyWhatsappTokens(
      this.settings().whatsappIntro?.trim() || WHATSAPP_INTRO_DEFAULT,
      name,
      'PED-0001'
    );
    const closing = applyWhatsappTokens(
      this.settings().whatsappClosing?.trim() || WHATSAPP_CLOSING_DEFAULT,
      name,
      'PED-0001'
    );
    return [
      intro,
      'Código de pedido: *PED-0001*',
      '',
      '🛒 Pedido:',
      '1. Remera rayada — Talle 4 x1 = $12.000',
      '',
      '💰 Total: $12.000',
      '',
      closing,
    ].join('\n');
  });

  has(section: PreviewFocus): boolean {
    const f = this.focus();
    return f.length === 0 || f.includes(section);
  }
}
