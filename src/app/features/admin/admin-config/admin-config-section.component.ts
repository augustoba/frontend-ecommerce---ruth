import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SettingsService, SiteSettings } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { resizeImageFile, validateImageFile } from '../../../core/utils/image-resize';
import { SitePreviewComponent, PreviewFocus } from '../../../shared/components/site-preview/site-preview.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { AdminMercadoPagoSettingsComponent } from './admin-mercadopago-settings.component';

type Section = 'identity' | 'social' | 'about' | 'whatsapp' | 'pagos';

/** Campos de `SiteSettings` que guardan la URL de una imagen (Cloudinary). */
type ImageField = 'logoUrl' | 'storePhotoUrl' | 'paymentQrTransferImage' | 'paymentQrCardImage' | 'promoBannerImage';

/** Carpeta y nombre en Cloudinary para cada campo de imagen. */
const IMAGE_UPLOAD: Record<ImageField, { folder: string; publicId: string }> = {
  logoUrl: { folder: 'estilos-pequenos/logo', publicId: 'logo' },
  storePhotoUrl: { folder: 'estilos-pequenos/local', publicId: 'foto-local' },
  paymentQrTransferImage: { folder: 'estilos-pequenos/pagos', publicId: 'qr-transferencia' },
  paymentQrCardImage: { folder: 'estilos-pequenos/pagos', publicId: 'qr-tarjeta' },
  promoBannerImage: { folder: 'estilos-pequenos/marketing', publicId: 'banner-promocional' },
};

const META: Record<Section, { title: string; blurb: string; focus: PreviewFocus[] }> = {
  identity: {
    title: 'Identidad y contacto',
    blurb:
      'El nombre y el logo aparecen en el encabezado, el pie de página, la pestaña del navegador y las ' +
      'pantallas del panel. El WhatsApp es el número al que le llegan los pedidos. La dirección se muestra ' +
      'en la opción "Retiro en el local" del checkout.',
    focus: ['header', 'whatsapp'],
  },
  social: {
    title: 'Redes sociales',
    blurb: 'Los links a Instagram y Facebook que se muestran en el pie de página. Dejá un campo vacío para ocultar ese link.',
    focus: ['social'],
  },
  about: {
    title: 'Sobre nosotros',
    blurb:
      'El texto de presentación del local. Se muestra en el pie de página, debajo del nombre. ' +
      'Si activás la página "Quiénes somos", este mismo texto (completo) se muestra ahí también, ' +
      'junto con la foto del local si cargaste una.',
    focus: ['about'],
  },
  whatsapp: {
    title: 'Mensaje de WhatsApp',
    blurb:
      'Los textos de saludo y de cierre del mensaje que se le arma al cliente cuando compra. El detalle del ' +
      'pedido y los totales van fijos en el medio. Podés usar {tienda} y {codigo}, que se reemplazan solos.',
    focus: ['whatsapp'],
  },
  pagos: {
    title: 'Medios de pago',
    blurb:
      'El cliente elige uno al comprar y queda en el pedido, así sabés qué mandarle. Cada medio se ofrece ' +
      'sólo si cargás su dato (alias, QR o link). El efectivo se habilita con el tilde.',
    focus: [],
  },
};


/**
 * Una sección del panel de configuración del sitio. Edita sólo su parte de
 * `SiteSettings` y al guardar la mezcla con el resto. Muestra la previsualización
 * en vivo al costado (salvo "Medios de pago", que no cambia cómo se ve la tienda).
 */
@Component({
  selector: 'app-admin-config-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, FormsModule, RouterLink, SitePreviewComponent, CldImagePipe, AdminMercadoPagoSettingsComponent],
  templateUrl: './admin-config-section.component.html',
})
export class AdminConfigSectionComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly settingsService = inject(SettingsService);
  private readonly toast = inject(ToastService);
  private readonly cloudinary = inject(CloudinaryService);

  readonly canUpload = this.cloudinary.configured;

  readonly section = (this.route.snapshot.data['section'] as Section) ?? 'identity';
  readonly meta = META[this.section];
  readonly previewFocus = this.meta.focus;
  readonly showPreview = this.meta.focus.length > 0;

  readonly status = this.settingsService.status;
  readonly saving = this.settingsService.saving;
  readonly reload = () => this.settingsService.reload();

  readonly draft = signal<SiteSettings>({ ...this.settingsService.settings() });
  readonly error = signal<string | null>(null);
  readonly uploading = signal<ImageField | null>(null);
  private touched = false;

  /** true cuando el borrador difiere de lo guardado. */
  readonly dirty = computed(
    () => JSON.stringify(this.draft()) !== JSON.stringify(this.settingsService.settings())
  );

  constructor() {
    this.settingsService.ensureLoaded();
    effect(() => {
      const s = this.settingsService.settings();
      if (!this.touched) this.draft.set({ ...s });
    });
  }

  patch<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]): void {
    this.touched = true;
    this.error.set(null);
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  // --- Imágenes (logo, QRs) ---

  async onImageSelected(event: Event, field: ImageField, maxWidth: number): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!this.cloudinary.configured) {
      this.error.set('La subida de imágenes todavía no está configurada (falta cargar Cloudinary).');
      return;
    }

    const invalid = validateImageFile(file);
    if (invalid) {
      this.error.set(invalid);
      return;
    }

    this.error.set(null);
    this.uploading.set(field);
    try {
      const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const resized = await resizeImageFile(file, maxWidth, 0.9, type);
      const { secureUrl } = await this.cloudinary.upload(resized, IMAGE_UPLOAD[field]);
      this.patch(field, secureUrl);
    } catch (e) {
      this.error.set(
        e instanceof Error ? `No se pudo subir la imagen: ${e.message}` : 'No se pudo subir la imagen.'
      );
    } finally {
      this.uploading.set(null);
    }
  }

  removeImage(field: ImageField): void {
    this.patch(field, null);
  }

  private syncFromServer(): void {
    this.touched = false;
    this.draft.set({ ...this.settingsService.settings() });
  }

  save(): void {
    if (this.saving()) return;
    this.error.set(null);
    const d = this.draft();

    if (this.section !== 'pagos') {
      if (!d.storeName.trim()) {
        this.error.set('Poné el nombre de la tienda.');
        return;
      }
      if (!/^\d{8,15}$/.test(d.whatsappNumber.trim())) {
        this.error.set(
          'El WhatsApp tiene que ser solo números (país + área + número, sin +, espacios ni el 15).'
        );
        return;
      }
    }

    const save$ =
      this.section === 'pagos'
        ? this.settingsService.updatePayments({
            paymentTransferEnabled: d.paymentTransferEnabled,
            paymentTransferAlias: d.paymentTransferAlias?.trim() || null,
            paymentQrTransferEnabled: d.paymentQrTransferEnabled,
            paymentQrTransferImage: d.paymentQrTransferImage || null,
            paymentQrCardEnabled: d.paymentQrCardEnabled,
            paymentQrCardImage: d.paymentQrCardImage || null,
            paymentCardLink: d.paymentCardLink?.trim() || null,
            paymentCashEnabled: d.paymentCashEnabled,
          })
        : this.settingsService.updatePlatform({
            storeName: d.storeName.trim(),
            whatsappNumber: d.whatsappNumber.trim(),
            aboutText: d.aboutText?.trim() || null,
            instagram: d.instagram?.trim().replace(/^@/, '') || null,
            facebookUrl: d.facebookUrl?.trim() || null,
            logoUrl: d.logoUrl || null,
            whatsappIntro: d.whatsappIntro?.trim() || null,
            whatsappClosing: d.whatsappClosing?.trim() || null,
            storeAddress: d.storeAddress?.trim() || null,
            storePhotoUrl: d.storePhotoUrl || null,
            aboutPageEnabled: d.aboutPageEnabled,
            promoBannerEnabled: d.promoBannerEnabled,
            promoBannerImage: d.promoBannerImage || null,
            promoBannerLink: d.promoBannerLink?.trim() || null,
          });

    save$.subscribe((ok) => {
      if (ok) {
        this.toast.success('Cambios guardados.');
        this.syncFromServer();
      } else {
        this.error.set('No se pudo guardar. Probá de nuevo.');
      }
    });
  }
}
