import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css',
})
export class AdminLoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly logoSrc = inject(SettingsService).logoSrc;
  readonly username = signal('');
  readonly password = signal('');
  readonly error = signal(false);
  readonly loading = signal(false);

  submit(): void {
    if (this.loading()) return;
    this.error.set(false);
    this.loading.set(true);
    this.authService.login(this.username(), this.password()).subscribe((ok) => {
      this.loading.set(false);
      if (ok) {
        this.router.navigate(['/admin/productos']);
      } else {
        this.error.set(true);
      }
    });
  }
}
