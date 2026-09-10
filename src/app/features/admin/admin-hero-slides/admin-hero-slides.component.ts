import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeroSlidesService } from '../../../core/services/hero-slides.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { resizeImageFile, validateImageFile } from '../../../core/utils/image-resize';

/** Proporción a la que se recortan las fotos del carrusel (ancho/alto). */
const CARRUSEL_ASPECT = 21 / 9;

@Component({
  selector: 'app-admin-hero-slides',
  imports: [FormsModule],
  templateUrl: './admin-hero-slides.component.html',
  styleUrl: './admin-hero-slides.component.css',
})
export class AdminHeroSlidesComponent {
  private readonly heroSlidesService = inject(HeroSlidesService);
  private readonly confirm = inject(ConfirmService);
  private readonly cloudinary = inject(CloudinaryService);

  readonly canUpload = this.cloudinary.configured;

  readonly slides = this.heroSlidesService.slides;
  readonly status = this.heroSlidesService.status;
  readonly saving = this.heroSlidesService.saving;
  readonly reload = () => this.heroSlidesService.reload();

  readonly newAlt = signal('');
  readonly uploading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.heroSlidesService.ensureLoaded();
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
}
