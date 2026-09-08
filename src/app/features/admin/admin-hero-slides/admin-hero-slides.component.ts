import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeroSlidesService } from '../../../core/services/hero-slides.service';
import { resizeImageFile } from '../../../core/utils/image-resize';

@Component({
  selector: 'app-admin-hero-slides',
  imports: [FormsModule],
  templateUrl: './admin-hero-slides.component.html',
  styleUrl: './admin-hero-slides.component.css',
})
export class AdminHeroSlidesComponent {
  private readonly heroSlidesService = inject(HeroSlidesService);

  readonly slides = this.heroSlidesService.slides;

  readonly newAlt = signal('');
  readonly uploading = signal(false);
  readonly error = signal<string | null>(null);

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.error.set(null);
    this.uploading.set(true);
    try {
      const dataUrl = await resizeImageFile(file);
      const ok = this.heroSlidesService.add(dataUrl, this.newAlt());
      if (!ok) {
        this.error.set(
          'No se pudo guardar la foto: se llenó el espacio de almacenamiento del navegador. Probá con menos fotos o fotos más livianas.'
        );
      } else {
        this.newAlt.set('');
      }
    } catch {
      this.error.set('No se pudo procesar esa imagen. Probá con otro archivo (JPG o PNG).');
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  updateAlt(id: string, alt: string): void {
    this.heroSlidesService.updateAlt(id, alt);
  }

  remove(id: string): void {
    const confirmed = window.confirm('¿Sacar esta foto del carrusel?');
    if (confirmed) this.heroSlidesService.remove(id);
  }

  moveUp(id: string): void {
    this.heroSlidesService.move(id, -1);
  }

  moveDown(id: string): void {
    this.heroSlidesService.move(id, 1);
  }

  resetToDefault(): void {
    const confirmed = window.confirm('¿Restaurar las ilustraciones de ejemplo? Se van a borrar las fotos que hayas subido.');
    if (confirmed) this.heroSlidesService.resetToDefault();
  }
}
