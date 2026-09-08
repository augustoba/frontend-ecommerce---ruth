import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-recover',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-recover.component.html',
})
export class AdminRecoverComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly username = signal('');
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
      .recover(this.username().trim(), this.phrase(), this.newPassword())
      .subscribe((ok) => {
        this.loading.set(false);
        if (ok) {
          this.router.navigate(['/admin/productos']);
        } else {
          this.error.set('El usuario o la frase de recuperación no coinciden.');
        }
      });
  }
}
