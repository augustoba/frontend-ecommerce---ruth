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
  readonly apiKey = signal('');
  readonly apiSecret = signal('');
  /** true si ya hay un API Secret guardado en el backend (nunca viaja el valor real). */
  readonly apiSecretSet = signal(false);

  readonly dirty = computed(() => {
    const s = this.settingsService.settings();
    return (
      this.cloudName() !== (s.cloudinaryCloudName ?? '') ||
      this.uploadPreset() !== (s.cloudinaryUploadPreset ?? '') ||
      !!this.apiKey() ||
      !!this.apiSecret()
    );
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
    this.settingsService.getCloudinaryConfig().subscribe((cfg) => {
      if (cfg) {
        this.apiKey.set(cfg.apiKey ?? '');
        this.apiSecretSet.set(cfg.apiSecretSet);
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

  patchApiKey(v: string): void {
    this.touched = true;
    this.error.set(null);
    this.apiKey.set(v);
  }

  patchApiSecret(v: string): void {
    this.touched = true;
    this.error.set(null);
    this.apiSecret.set(v);
  }

  save(): void {
    if (this.saving()) return;
    this.error.set(null);
    this.settingsService
      .updateCloudinaryConfig({
        cloudName: this.cloudName().trim() || null,
        uploadPreset: this.uploadPreset().trim() || null,
        apiKey: this.apiKey().trim() || null,
        apiSecret: this.apiSecret().trim() || null,
      })
      .subscribe((res) => {
        if (res) {
          this.touched = false;
          this.apiSecret.set('');
          this.apiSecretSet.set(res.apiSecretSet);
          this.toast.success('Cambios guardados.');
        } else {
          this.error.set('No se pudo guardar. Probá de nuevo.');
        }
      });
  }
}
