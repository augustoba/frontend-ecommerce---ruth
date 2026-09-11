import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlatformMailService } from '../../../core/services/platform-mail.service';
import { ToastService } from '../../../core/services/toast.service';

/** Config del servicio de mail (SMTP). Sólo superadmin — se usa para las campañas. */
@Component({
  selector: 'app-admin-mail-settings',
  imports: [FormsModule],
  templateUrl: './admin-mail-settings.component.html',
})
export class AdminMailSettingsComponent {
  private readonly service = inject(PlatformMailService);
  private readonly toast = inject(ToastService);

  readonly status = this.service.status;
  readonly saving = this.service.saving;

  readonly host = signal('');
  readonly port = signal(587);
  readonly username = signal('');
  readonly password = signal('');
  readonly fromAddress = signal('');
  readonly passwordSet = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.service.ensureLoaded();
    effect(() => {
      const s = this.service.settings();
      if (s) {
        this.host.set(s.host);
        this.port.set(s.port);
        this.username.set(s.username);
        this.fromAddress.set(s.fromAddress);
        this.passwordSet.set(s.passwordSet);
      }
    });
  }

  readonly passwordHint = computed(() =>
    this.passwordSet() ? 'Ya hay una clave guardada. Dejá vacío para no cambiarla.' : 'Todavía no cargaste una clave.'
  );

  save(): void {
    this.error.set(null);
    if (!this.host().trim() || !this.username().trim() || !this.fromAddress().trim()) {
      this.error.set('Completá servidor, usuario y remitente.');
      return;
    }
    this.service.update(
      {
        host: this.host().trim(),
        port: this.port(),
        username: this.username().trim(),
        password: this.password(),
        fromAddress: this.fromAddress().trim(),
      },
      () => {
        this.toast.success('Servicio de mail actualizado.');
        this.password.set('');
      }
    );
  }
}
