import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MailConfig, SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Config de SMTP (Brevo u otro proveedor) para la recuperación de cuenta por
 * mail. Sólo superadmin — ver `superAdminGuard` y `SUPERADMIN` authority en
 * el backend. El envío en sí todavía no está conectado (falta el `MailService`
 * del lado del backend); esta pantalla sólo guarda las credenciales.
 */
@Component({
  selector: 'app-admin-superadmin-mail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './admin-superadmin-mail.component.html',
})
export class AdminSuperadminMailComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly toast = inject(ToastService);

  readonly saving = this.settingsService.saving;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly passwordSet = signal(false);

  readonly host = signal('');
  readonly port = signal<number | null>(587);
  readonly username = signal('');
  readonly password = signal(''); // vacío al cargar: si no se toca, no pisa la guardada
  readonly fromEmail = signal('');
  readonly fromName = signal('');

  constructor() {
    this.settingsService.getMailConfig().subscribe((cfg) => {
      this.loading.set(false);
      if (!cfg) {
        this.error.set('No se pudo cargar la config de mail.');
        return;
      }
      this.apply(cfg);
    });
  }

  private apply(cfg: MailConfig): void {
    this.host.set(cfg.host ?? '');
    this.port.set(cfg.port ?? 587);
    this.username.set(cfg.username ?? '');
    this.fromEmail.set(cfg.fromEmail ?? '');
    this.fromName.set(cfg.fromName ?? '');
    this.passwordSet.set(cfg.passwordSet);
  }

  save(): void {
    if (this.saving()) return;
    this.error.set(null);
    this.settingsService
      .updateMailConfig({
        host: this.host().trim() || null,
        port: this.port(),
        username: this.username().trim() || null,
        password: this.password().trim() || null,
        fromEmail: this.fromEmail().trim() || null,
        fromName: this.fromName().trim() || null,
      })
      .subscribe((cfg) => {
        if (cfg) {
          this.apply(cfg);
          this.password.set('');
          this.toast.success('Cambios guardados.');
        } else {
          this.error.set('No se pudo guardar. Probá de nuevo.');
        }
      });
  }
}
