import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Credenciales de Mercado Pago (Checkout Pro), dentro de "Medios de pago".
 * Activarlo hace que Mercado Pago sea el ÚNICO medio de pago de la venta
 * online (ver `SettingsService.availablePaymentMethods`) — no afecta la venta
 * en el local, que sigue siendo efectivo/transferencia/posnet nomás.
 */
@Component({
  selector: 'app-admin-mercadopago-settings',
  imports: [FormsModule],
  templateUrl: './admin-mercadopago-settings.component.html',
})
export class AdminMercadoPagoSettingsComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly toast = inject(ToastService);

  readonly loaded = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly mpEnabled = signal(false);
  readonly accessToken = signal('');
  readonly accessTokenSet = signal(false);
  readonly publicKey = signal('');

  readonly accessTokenHint = computed(() =>
    this.accessTokenSet()
      ? 'Ya hay un Access Token guardado. Dejá vacío para no cambiarlo.'
      : 'Todavía no cargaste un Access Token.'
  );

  constructor() {
    this.settingsService.getMercadoPagoConfig().subscribe((cfg) => {
      this.loaded.set(true);
      if (!cfg) return;
      this.mpEnabled.set(cfg.mpEnabled);
      this.accessTokenSet.set(cfg.accessTokenSet);
      this.publicKey.set(cfg.publicKey ?? '');
    });
  }

  save(): void {
    if (this.saving()) return;
    this.error.set(null);
    if (this.mpEnabled() && !this.accessTokenSet() && !this.accessToken().trim()) {
      this.error.set('Para activar Mercado Pago primero cargá el Access Token.');
      return;
    }
    this.saving.set(true);
    this.settingsService
      .updateMercadoPagoConfig({
        mpEnabled: this.mpEnabled(),
        accessToken: this.accessToken().trim() || null,
        publicKey: this.publicKey().trim() || null,
      })
      .subscribe((cfg) => {
        this.saving.set(false);
        if (cfg) {
          this.mpEnabled.set(cfg.mpEnabled);
          this.accessTokenSet.set(cfg.accessTokenSet);
          this.publicKey.set(cfg.publicKey ?? '');
          this.accessToken.set('');
          this.toast.success('Mercado Pago actualizado.');
        } else {
          this.error.set('No se pudo guardar. Probá de nuevo.');
        }
      });
  }
}
