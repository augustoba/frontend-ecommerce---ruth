import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { apiUrl } from '../config/site-config';

/** Resultado de un intento de login / recuperación. */
export interface AuthResult {
  ok: boolean;
  /** Mensaje para mostrarle al usuario (del backend si vino, o genérico). */
  message?: string;
  /** true si el backend respondió 429 (demasiados intentos). */
  blocked?: boolean;
  /** Segundos a esperar antes de reintentar (header Retry-After). */
  retryAfterSeconds?: number;
}

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

  /** Usuario del token actual (claim `sub` del JWT), o '' */
  readonly username = computed(() => {
    const t = this.tokenSignal();
    if (!t || t.expiresAt <= Date.now()) return '';
    return decodeSub(t.token);
  });

  token(): string | null {
    const t = this.tokenSignal();
    return t && t.expiresAt > Date.now() ? t.token : null;
  }

  login(username: string, password: string): Observable<AuthResult> {
    return this.postToken(apiUrl('/auth/login'), { username, password });
  }

  /** Recuperar la cuenta con la frase de recuperación → setea la pass nueva y loguea. */
  recover(username: string, recoveryPhrase: string, newPassword: string): Observable<AuthResult> {
    return this.postToken(apiUrl('/auth/recover'), { username, recoveryPhrase, newPassword });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<boolean> {
    return this.http
      .put(apiUrl('/admin/account/password'), { currentPassword, newPassword })
      .pipe(map(() => true), catchError(() => of(false)));
  }

  changeRecoveryPhrase(currentPassword: string, recoveryPhrase: string): Observable<boolean> {
    return this.http
      .put(apiUrl('/admin/account/recovery'), { currentPassword, recoveryPhrase })
      .pipe(map(() => true), catchError(() => of(false)));
  }

  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    this.tokenSignal.set(null);
  }

  private postToken(url: string, body: unknown): Observable<AuthResult> {
    return this.http.post<LoginResponse>(url, body).pipe(
      map((res) => {
        const stored: StoredToken = {
          token: res.token,
          expiresAt: new Date(res.expiresAt).getTime(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        this.tokenSignal.set(stored);
        return { ok: true } as AuthResult;
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 429) {
          const header = Number(err.headers?.get('Retry-After'));
          const bodyMsg = (err.error as { message?: string } | null)?.message;
          return of<AuthResult>({
            ok: false,
            blocked: true,
            message: bodyMsg || 'Demasiados intentos. Esperá un rato antes de reintentar.',
            retryAfterSeconds: Number.isFinite(header) && header > 0 ? header : 900,
          });
        }
        return of<AuthResult>({ ok: false });
      })
    );
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

/** Lee el claim `sub` de un JWT sin validar la firma (solo para mostrar el nombre). */
function decodeSub(jwt: string): string {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.sub === 'string' ? payload.sub : '';
  } catch {
    return '';
  }
}
