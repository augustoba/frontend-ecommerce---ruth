import { Injectable, signal } from '@angular/core';
import { SITE_CONFIG } from '../config/site-config';

const STORAGE_KEY = 'pp_admin_session';

/**
 * Autenticación muy simple para proteger /admin en esta primera versión sin
 * backend. NO es un mecanismo seguro (las credenciales están en el bundle
 * del frontend): sirve para uso personal del dueño/a del local, no para
 * datos sensibles. Cuando exista el backend en Java, reemplazar esto por
 * un login real (JWT / sesión del servidor).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authenticatedSignal = signal<boolean>(this.loadInitial());

  readonly isAuthenticated = this.authenticatedSignal.asReadonly();

  login(username: string, password: string): boolean {
    const ok =
      username.trim() === SITE_CONFIG.admin.username &&
      password === SITE_CONFIG.admin.password;
    if (ok) {
      this.authenticatedSignal.set(true);
      sessionStorage.setItem(STORAGE_KEY, '1');
    }
    return ok;
  }

  logout(): void {
    this.authenticatedSignal.set(false);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  private loadInitial(): boolean {
    if (typeof sessionStorage === 'undefined') return false;
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  }
}
