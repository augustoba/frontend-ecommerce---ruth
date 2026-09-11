import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-admin-recover',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-recover.component.html',
})
export class AdminRecoverComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly logoSrc = inject(SettingsService).logoSrc;

  readonly dni = signal('');
  readonly phrase = signal('');
  readonly newPassword = signal('');
  readonly newPassword2 = signal('');
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  submit(): void {
    if (this.loading()) return;
    this.error.set(null);

    if (this.newPassword().length < 4) {
      this.error.set('La contraseña nueva tiene que tener al menos 4 caracteres.');
      return;
    }
    if (this.newPassword() !== this.newPassword2()) {
      this.error.set('Las dos contraseñas no coinciden.');
      return;
    }

    this.loading.set(true);
    this.authService
      .recover(this.dni().trim(), this.phrase(), this.newPassword())
      .subscribe((res) => {
        this.loading.set(false);
        if (res.ok) {
          this.router.navigate(['/admin/productos']);
        } else if (res.blocked) {
          this.error.set(res.message ?? 'Demasiados intentos. Esperá un rato antes de reintentar.');
        } else {
          this.error.set('El DNI o la frase de recuperación no coinciden.');
        }
      });
  }
}
