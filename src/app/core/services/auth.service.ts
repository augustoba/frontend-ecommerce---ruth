import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { apiUrl } from '../config/site-config';
import { Permission } from '../models/permission.model';

/** Quién soy y qué permisos tengo (de `/api/auth/me`). */
export interface Me {
  username: string;
  roleName: string | null;
  systemAdmin: boolean;
  permissions: Permission[];
}

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

  /** Permisos del usuario logueado (de `/api/auth/me`). null = todavía no cargó. */
  private readonly meSignal = signal<Me | null>(null);
  readonly me = this.meSignal.asReadonly();

  /**
   * Estado de la carga de permisos:
   *  - 'idle'/'loading': todavía no sabemos.
   *  - 'loaded': `me` tiene los permisos reales.
   *  - 'unavailable': el backend no respondió `/api/auth/me` (versión vieja, caído,
   *    red). En ese caso `has()` deja pasar todo — el backend igual valida cada
   *    endpoint con `@PreAuthorize`, así que no se pierde seguridad, sólo se evita
   *    dejar al admin sin menú por un problema de red.
   */
  private readonly meStatus = signal<'idle' | 'loading' | 'loaded' | 'unavailable'>('idle');

  readonly isAuthenticated = computed(() => {
    const t = this.tokenSignal();
    return !!t && t.expiresAt > Date.now();
  });

  constructor() {
    if (this.token()) this.loadMe().subscribe();
  }

  /** ¿El usuario tiene este permiso? (el admin de sistema los tiene todos). */
  has(permission: Permission): boolean {
    const m = this.meSignal();
    if (m) return m.systemAdmin || m.permissions.includes(permission);
    // Sin datos de permisos: si el backend no contestó, no bloqueamos (fail-open);
    // si todavía está cargando, esperamos (el guard hace await de loadMe()).
    return this.meStatus() === 'unavailable';
  }

  /** true si no pudimos determinar los permisos (backend viejo o caído). */
  readonly permissionsUnavailable = computed(() => this.meStatus() === 'unavailable');

  /** Carga (o recarga) `/api/auth/me`. Devuelve el Me o null si falla. */
  loadMe(): Observable<Me | null> {
    this.meStatus.set('loading');
    return this.http.get<Me>(apiUrl('/auth/me')).pipe(
      tap((m) => {
        this.meSignal.set(m);
        this.meStatus.set('loaded');
      }),
      catchError((err: HttpErrorResponse) => {
        this.meSignal.set(null);
        // 401/403 → token inválido o sin acceso: no fingir permisos.
        this.meStatus.set(err.status === 401 || err.status === 403 ? 'loaded' : 'unavailable');
        if (err.status === 401) this.logout();
        return of(null);
      })
    );
  }

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
    this.meSignal.set(null);
    this.meStatus.set('idle');
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
        this.loadMe().subscribe();
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
