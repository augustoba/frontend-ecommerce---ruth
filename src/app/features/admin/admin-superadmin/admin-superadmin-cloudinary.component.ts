import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Config de Cloudinary (cuenta usada para subir fotos desde el panel: productos,
 * carrusel, logo, QRs de pago). Sólo superadmin — ver `superAdminGuard` en la
 * ruta y `SUPERADMIN` authority en el backend.
 */
@Component({
  selector: 'app-admin-superadmin-cloudinary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './admin-superadmin-cloudinary.component.html',
})
export class AdminSuperadminCloudinaryComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly toast = inject(ToastService);

  readonly saving = this.settingsService.saving;
  readonly error = signal<string | null>(null);
  private touched = false;

  readonly cloudName = signal(this.settingsService.settings().cloudinaryCloudName ?? '');
  readonly uploadPreset = signal(this.settingsService.settings().cloudinaryUploadPreset ?? '');

  readonly dirty = computed(() => {
    const s = this.settingsService.settings();
    return this.cloudName() !== (s.cloudinaryCloudName ?? '') || this.uploadPreset() !== (s.cloudinaryUploadPreset ?? '');
  });

  constructor() {
    this.settingsService.ensureLoaded();
    effect(() => {
      const s = this.settingsService.settings();
      if (!this.touched) {
        this.cloudName.set(s.cloudinaryCloudName ?? '');
        this.uploadPreset.set(s.cloudinaryUploadPreset ?? '');
      }
    });
  }

  patchCloudName(v: string): void {
    this.touched = true;
    this.error.set(null);
    this.cloudName.set(v);
  }

  patchUploadPreset(v: string): void {
    this.touched = true;
    this.error.set(null);
    this.uploadPreset.set(v);
  }

  save(): void {
    if (this.saving()) return;
    this.error.set(null);
    this.settingsService
      .updateCloudinaryConfig(this.cloudName().trim() || null, this.uploadPreset().trim() || null)
      .subscribe((ok) => {
        if (ok) {
          this.touched = false;
          this.toast.success('Cambios guardados.');
        } else {
          this.error.set('No se pudo guardar. Probá de nuevo.');
        }
      });
  }
}
