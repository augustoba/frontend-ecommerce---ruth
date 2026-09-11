import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Cartel fijo arriba de TODA la app (panel y tienda) avisando que hay una
 * sesión de admin activa. Vive en `AppComponent`, no en `AdminLayoutComponent`,
 * justamente para que se vea también navegando la tienda pública logueado.
 */
@Component({
  selector: 'app-session-banner',
  imports: [RouterLink],
  templateUrl: './session-banner.component.html',
})
export class SessionBannerComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly visible = computed(() => this.authService.isAuthenticated() && !!this.authService.me());
  readonly displayName = this.authService.displayName;
  readonly roleName = computed(() => this.authService.me()?.roleName ?? '');

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
