import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MercadoPagoConfig, SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Credenciales de Mercado Pago DE LA TIENDA (Fase 13, checkout online real)
 * — a diferencia de Cloudinary/Mail, la edita el admin normal
 * (`PAYMENTS_MANAGE`), no sólo el superadmin: es la cuenta de Mercado Pago
 * del propio dueño de la tienda, no una compartida de plataforma.
 */
@Component({
  selector: 'app-admin-mercadopago',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './admin-mercadopago.component.html',
})
export class AdminMercadoPagoComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly toast = inject(ToastService);

  readonly saving = this.settingsService.saving;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly accessTokenSet = signal(false);

  readonly mpEnabled = signal(false);
  readonly accessToken = signal(''); // vacío al cargar: si no se toca, no pisa el guardado
  readonly publicKey = signal('');

  constructor() {
    this.settingsService.getMercadoPagoConfig().subscribe((cfg) => {
      this.loading.set(false);
      if (!cfg) {
        this.error.set('No se pudo cargar la configuración de Mercado Pago.');
        return;
      }
      this.apply(cfg);
    });
  }

  private apply(cfg: MercadoPagoConfig): void {
    this.mpEnabled.set(cfg.mpEnabled);
    this.publicKey.set(cfg.publicKey ?? '');
    this.accessTokenSet.set(cfg.accessTokenSet);
  }

  save(): void {
    if (this.saving()) return;
    this.error.set(null);
    if (this.mpEnabled() && !this.accessTokenSet() && !this.accessToken().trim()) {
      this.error.set('Para activarlo necesitás cargar el Access Token.');
      return;
    }
    this.settingsService
      .updateMercadoPagoConfig({
        mpEnabled: this.mpEnabled(),
        accessToken: this.accessToken().trim() || null,
        publicKey: this.publicKey().trim() || null,
      })
      .subscribe((cfg) => {
        if (cfg) {
          this.apply(cfg);
          this.accessToken.set('');
          this.toast.success('Cambios guardados.');
        } else {
          this.error.set('No se pudo guardar. Probá de nuevo.');
        }
      });
  }
}
