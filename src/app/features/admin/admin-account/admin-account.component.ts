import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-account',
  imports: [FormsModule],
  templateUrl: './admin-account.component.html',
})
export class AdminAccountComponent {
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly me = this.authService.me;

  // cambiar contraseña
  readonly curPass = signal('');
  readonly newPass = signal('');
  readonly newPass2 = signal('');
  readonly pwError = signal<string | null>(null);
  readonly pwSaving = signal(false);

  changePassword(): void {
    if (this.pwSaving()) return;
    this.pwError.set(null);
    if (this.newPass().length < 4) {
      this.pwError.set('La contraseña nueva tiene que tener al menos 4 caracteres.');
      return;
    }
    if (this.newPass() !== this.newPass2()) {
      this.pwError.set('Las dos contraseñas nuevas no coinciden.');
      return;
    }
    this.pwSaving.set(true);
    this.authService.changePassword(this.curPass(), this.newPass()).subscribe((ok) => {
      this.pwSaving.set(false);
      if (ok) {
        this.toast.success('Contraseña actualizada.');
        this.curPass.set('');
        this.newPass.set('');
        this.newPass2.set('');
      } else {
        this.pwError.set('No se pudo cambiar. ¿La contraseña actual es correcta?');
      }
    });
  }
}
