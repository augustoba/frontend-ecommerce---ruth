import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';

/** Alerta diaria (07:00) por mail con los talles en stock bajo. */
@Component({
  selector: 'app-admin-stock-alert-settings',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-stock-alert-settings.component.html',
})
export class AdminStockAlertSettingsComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly toast = inject(ToastService);

  readonly loaded = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly enabled = signal(false);
  readonly email = signal('');

  constructor() {
    this.settingsService.getStockAlertConfig().subscribe((cfg) => {
      this.loaded.set(true);
      if (!cfg) return;
      this.enabled.set(cfg.lowStockAlertEnabled);
      this.email.set(cfg.lowStockAlertEmail ?? '');
    });
  }

  save(): void {
    if (this.saving()) return;
    this.error.set(null);
    if (this.enabled() && !this.email().trim()) {
      this.error.set('Para activar la alerta primero cargá un email.');
      return;
    }
    this.saving.set(true);
    this.settingsService
      .updateStockAlertConfig({
        lowStockAlertEnabled: this.enabled(),
        lowStockAlertEmail: this.email().trim() || null,
      })
      .subscribe((cfg) => {
        this.saving.set(false);
        if (cfg) {
          this.enabled.set(cfg.lowStockAlertEnabled);
          this.email.set(cfg.lowStockAlertEmail ?? '');
          this.toast.success('Alerta de stock bajo actualizada.');
        } else {
          this.error.set('No se pudo guardar. Probá de nuevo.');
        }
      });
  }
}
