import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ArcaConfig, SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Credenciales de ARCA (ex AFIP) DE LA TIENDA (Fase 14, facturación
 * electrónica real) — mismo criterio que Mercado Pago: lo edita el admin
 * normal (`PAYMENTS_MANAGE`), es su propio CUIT, no uno compartido.
 */
@Component({
  selector: 'app-admin-arca',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './admin-arca.component.html',
})
export class AdminArcaComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly toast = inject(ToastService);

  readonly saving = this.settingsService.saving;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly certificadoSet = signal(false);
  readonly clavePrivadaSet = signal(false);

  readonly arcaEnabled = signal(false);
  readonly arcaModoPrueba = signal(true);
  readonly cuit = signal('');
  readonly puntoVenta = signal<number | null>(null);
  readonly condicionIva = signal('');
  readonly certificadoPem = signal(''); // vacío al cargar: si no se toca, no pisa lo guardado
  readonly clavePrivadaPem = signal('');
  readonly invoiceMode = signal<'TICKET_INTERNO' | 'FACTURA_ARCA'>('TICKET_INTERNO');

  constructor() {
    this.settingsService.getArcaConfig().subscribe((cfg) => {
      this.loading.set(false);
      if (!cfg) {
        this.error.set('No se pudo cargar la configuración de ARCA.');
        return;
      }
      this.apply(cfg);
    });
  }

  private apply(cfg: ArcaConfig): void {
    this.arcaEnabled.set(cfg.arcaEnabled);
    this.arcaModoPrueba.set(cfg.arcaModoPrueba);
    this.cuit.set(cfg.cuit ?? '');
    this.puntoVenta.set(cfg.puntoVenta);
    this.condicionIva.set(cfg.condicionIva ?? '');
    this.certificadoSet.set(cfg.certificadoSet);
    this.clavePrivadaSet.set(cfg.clavePrivadaSet);
    this.invoiceMode.set(cfg.invoiceMode);
  }

  save(): void {
    if (this.saving()) return;
    this.error.set(null);
    if (this.invoiceMode() === 'FACTURA_ARCA') {
      if (!this.cuit().trim() || !this.puntoVenta()) {
        this.error.set('Para facturar necesitás CUIT y punto de venta.');
        return;
      }
      if (!this.certificadoSet() && !this.certificadoPem().trim()) {
        this.error.set('Para facturar necesitás cargar el certificado.');
        return;
      }
      if (!this.clavePrivadaSet() && !this.clavePrivadaPem().trim()) {
        this.error.set('Para facturar necesitás cargar la clave privada.');
        return;
      }
    }
    this.settingsService
      .updateArcaConfig({
        arcaEnabled: this.arcaEnabled(),
        arcaModoPrueba: this.arcaModoPrueba(),
        cuit: this.cuit().trim() || null,
        puntoVenta: this.puntoVenta(),
        condicionIva: this.condicionIva().trim() || null,
        certificadoPem: this.certificadoPem().trim() || null,
        clavePrivadaPem: this.clavePrivadaPem().trim() || null,
        invoiceMode: this.invoiceMode(),
      })
      .subscribe((cfg) => {
        if (cfg) {
          this.apply(cfg);
          this.certificadoPem.set('');
          this.clavePrivadaPem.set('');
          this.toast.success('Cambios guardados.');
        } else {
          this.error.set('No se pudo guardar. Probá de nuevo.');
        }
      });
  }
}
