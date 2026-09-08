import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { apiUrl } from '../config/site-config';

const STORAGE_KEY = 'pp_admin_token';

interface StoredToken {
  token: string;
  expiresAt: number; // epoch ms
}

interface LoginResponse {
  token: string;
  tokenType: string;
  expiresAt: string; // ISO
}

/**
 * Autenticación del panel de administración contra el backend.
 * `POST /api/auth/login` devuelve un JWT que se guarda en localStorage y se
 * manda como `Authorization: Bearer` en las requests a `/api/admin/**`
 * (ver auth.interceptor.ts).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly tokenSignal = signal<StoredToken | null>(this.loadStored());

  readonly isAuthenticated = computed(() => {
    const t = this.tokenSignal();
    return !!t && t.expiresAt > Date.now();
  });

  token(): string | null {
    const t = this.tokenSignal();
    return t && t.expiresAt > Date.now() ? t.token : null;
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http
      .post<LoginResponse>(apiUrl('/auth/login'), { username, password })
      .pipe(
        map((res) => {
          const stored: StoredToken = {
            token: res.token,
            expiresAt: new Date(res.expiresAt).getTime(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
          this.tokenSignal.set(stored);
          return true;
        }),
        catchError(() => of(false))
      );
  }

  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    this.tokenSignal.set(null);
  }

  private loadStored(): StoredToken | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StoredToken;
      if (!parsed?.token || !parsed?.expiresAt || parsed.expiresAt <= Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }
}
