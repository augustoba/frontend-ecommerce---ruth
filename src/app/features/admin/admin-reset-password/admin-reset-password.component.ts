import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SettingsService } from '../../../core/services/settings.service';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';

/** Pantalla del link que manda el mail de "olvidé mi contraseña" — ver AdminRecoverComponent. */
@Component({
  selector: 'app-admin-reset-password',
  imports: [FormsModule, RouterLink, CldImagePipe],
  templateUrl: './admin-reset-password.component.html',
})
export class AdminResetPasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly logoSrc = inject(SettingsService).logoSrc;
  readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';

  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  readonly done = signal(false);

  submit(): void {
    if (this.loading() || !this.token) return;
    if (this.newPassword().length < 4) {
      this.error.set('La contraseña tiene que tener al menos 4 caracteres.');
      return;
    }
    if (this.newPassword() !== this.confirmPassword()) {
      this.error.set('Las dos contraseñas no coinciden.');
      return;
    }
    this.error.set(null);
    this.loading.set(true);
    this.authService.resetPassword(this.token, this.newPassword()).subscribe((res) => {
      this.loading.set(false);
      if (res.ok) {
        this.done.set(true);
      } else {
        this.error.set(res.message ?? 'No se pudo cambiar la contraseña.');
      }
    });
  }
}
