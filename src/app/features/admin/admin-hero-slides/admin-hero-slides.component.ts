import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeroSlidesService } from '../../../core/services/hero-slides.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';
import { resizeImageFile, validateImageFile } from '../../../core/utils/image-resize';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';

/** Proporción a la que se recortan las fotos del carrusel (ancho/alto). */
const CARRUSEL_ASPECT = 21 / 9;

/** Lo que se edita del banner promocional (popup al entrar a la tienda). */
interface BannerDraft {
  enabled: boolean;
  image: string | null;
  link: string;
}

@Component({
  selector: 'app-admin-hero-slides',
  imports: [FormsModule, CldImagePipe],
  templateUrl: './admin-hero-slides.component.html',
  styleUrl: './admin-hero-slides.component.css',
})
export class AdminHeroSlidesComponent {
  private readonly heroSlidesService = inject(HeroSlidesService);
  private readonly confirm = inject(ConfirmService);
  private readonly cloudinary = inject(CloudinaryService);
  private readonly settingsService = inject(SettingsService);
  private readonly toast = inject(ToastService);

  readonly canUpload = this.cloudinary.configured;

  readonly slides = this.heroSlidesService.slides;
  readonly status = this.heroSlidesService.status;
  readonly saving = this.heroSlidesService.saving;
  readonly reload = () => this.heroSlidesService.reload();

  readonly newAlt = signal('');
  readonly uploading = signal(false);
  readonly error = signal<string | null>(null);

  // --- Banner promocional ---
  readonly banner = signal<BannerDraft>(this.savedBanner());
  readonly bannerUploading = signal(false);
  readonly bannerError = signal<string | null>(null);
  readonly bannerSaving = this.settingsService.saving;
  private bannerTouched = false;

  /** true cuando el borrador del banner difiere de lo guardado. */
  readonly bannerDirty = computed(
    () => JSON.stringify(this.banner()) !== JSON.stringify(this.savedBanner())
  );

  constructor() {
    this.heroSlidesService.ensureLoaded();
    this.settingsService.ensureLoaded();
    effect(() => {
      const saved = this.savedBanner();
      if (!this.bannerTouched) this.banner.set(saved);
    });
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!this.cloudinary.configured) {
      this.error.set('La subida de fotos todavía no está configurada (ver site-config.ts).');
      input.value = '';
      return;
    }

    const invalid = validateImageFile(file);
    if (invalid) {
      this.error.set(invalid);
      input.value = '';
      return;
    }

    this.error.set(null);
    this.uploading.set(true);
    try {
      // Se recorta a lo apaisado antes de subir para que todas queden iguales.
      const resized = await resizeImageFile(file, 1920, 0.82, 'image/jpeg', CARRUSEL_ASPECT);
      const position = this.slides().length + 1;
      const { secureUrl } = await this.cloudinary.upload(resized, {
        folder: 'estilos-pequenos/carrusel',
        publicId: `carrusel-${position}`,
      });
      this.heroSlidesService.add(secureUrl, this.newAlt());
      this.newAlt.set('');
    } catch (e) {
      this.error.set(
        e instanceof Error ? `No se pudo subir la foto: ${e.message}` : 'No se pudo subir la foto.'
      );
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  updateAlt(id: string, alt: string): void {
    this.heroSlidesService.updateAlt(id, alt);
  }

  async remove(id: string): Promise<void> {
    const ok = await this.confirm.confirm({
      message: '¿Sacar esta foto del carrusel?',
      confirmLabel: 'Sacar',
      danger: true,
    });
    if (ok) this.heroSlidesService.remove(id);
  }

  moveUp(id: string): void {
    this.heroSlidesService.move(id, -1);
  }

  moveDown(id: string): void {
    this.heroSlidesService.move(id, 1);
  }

  private savedBanner(): BannerDraft {
    const s = this.settingsService.settings();
    return { enabled: s.promoBannerEnabled, image: s.promoBannerImage, link: s.promoBannerLink ?? '' };
  }

  patchBanner(change: Partial<BannerDraft>): void {
    this.bannerTouched = true;
    this.bannerError.set(null);
    this.banner.update((b) => ({ ...b, ...change }));
  }

  async onBannerFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const invalid = validateImageFile(file);
    if (invalid) {
      this.bannerError.set(invalid);
      return;
    }

    this.bannerError.set(null);
    this.bannerUploading.set(true);
    try {
      const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const resized = await resizeImageFile(file, 1200, 0.9, type);
      const { secureUrl } = await this.cloudinary.upload(resized, {
        folder: 'estilos-pequenos/marketing',
        publicId: 'banner-promocional',
      });
      this.patchBanner({ image: secureUrl });
    } catch (e) {
      this.bannerError.set(
        e instanceof Error ? `No se pudo subir la imagen: ${e.message}` : 'No se pudo subir la imagen.'
      );
    } finally {
      this.bannerUploading.set(false);
    }
  }

  saveBanner(): void {
    if (this.bannerSaving()) return;
    this.bannerError.set(null);
    const b = this.banner();
    this.settingsService
      .updatePromoBanner({
        promoBannerEnabled: b.enabled,
        promoBannerImage: b.image || null,
        promoBannerLink: b.link.trim() || null,
      })
      .subscribe((ok) => {
        if (ok) {
          this.toast.success('Banner guardado.');
          this.bannerTouched = false;
          this.banner.set(this.savedBanner());
        } else {
          this.bannerError.set('No se pudo guardar el banner. Probá de nuevo.');
        }
      });
  }
}
