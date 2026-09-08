import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService, SiteSettings } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-settings',
  imports: [FormsModule],
  templateUrl: './admin-settings.component.html',
})
export class AdminSettingsComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly toast = inject(ToastService);

  readonly status = this.settingsService.status;
  readonly saving = this.settingsService.saving;
  readonly reload = () => this.settingsService.reload();

  readonly draft = signal<SiteSettings>({ ...this.settingsService.settings() });
  readonly error = signal<string | null>(null);
  private touched = false;

  constructor() {
    this.settingsService.ensureLoaded();
    // Cuando llegan los datos del server, cargarlos en el form — pero solo
    // mientras el usuario todavía no editó nada.
    effect(() => {
      const s = this.settingsService.settings();
      if (!this.touched) this.draft.set({ ...s });
    });
  }

  syncFromServer(): void {
    this.touched = false;
    this.draft.set({ ...this.settingsService.settings() });
  }

  patch<K extends keyof SiteSettings>(key: K, value: string): void {
    this.touched = true;
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    if (this.saving()) return;
    this.error.set(null);
    const d = this.draft();
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
    this.settingsService
      .update({
        storeName: d.storeName.trim(),
        whatsappNumber: d.whatsappNumber.trim(),
        aboutText: d.aboutText?.trim() || null,
        instagram: d.instagram?.trim().replace(/^@/, '') || null,
        facebookUrl: d.facebookUrl?.trim() || null,
      })
      .subscribe((ok) => {
        if (ok) {
          this.toast.success('Datos del local actualizados.');
          this.syncFromServer();
        } else {
          this.error.set('No se pudo guardar. Probá de nuevo.');
        }
      });
  }
}
