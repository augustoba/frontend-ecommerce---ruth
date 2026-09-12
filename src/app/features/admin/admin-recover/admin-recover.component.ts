import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SettingsService } from '../../../core/services/settings.service';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';

@Component({
  selector: 'app-admin-recover',
  imports: [FormsModule, RouterLink, CldImagePipe],
  templateUrl: './admin-recover.component.html',
})
export class AdminRecoverComponent {
  private readonly authService = inject(AuthService);

  readonly logoSrc = inject(SettingsService).logoSrc;

  readonly dni = signal('');
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  readonly sent = signal(false);

  submit(): void {
    if (this.loading() || !this.dni().trim()) return;
    this.error.set(null);
    this.loading.set(true);
    this.authService.forgotPassword(this.dni().trim()).subscribe((res) => {
      this.loading.set(false);
      if (res.blocked) {
        this.error.set(res.message ?? 'Demasiados intentos. Esperá un rato antes de reintentar.');
      } else {
        // Responde igual exista o no el DNI: siempre mostramos el mismo mensaje.
        this.sent.set(true);
      }
    });
  }
}
