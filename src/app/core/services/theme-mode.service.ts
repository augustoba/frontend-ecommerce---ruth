import { Injectable, effect, signal } from '@angular/core';

const STORAGE_KEY = 'theme-mode';

/**
 * Modo claro/oscuro elegido por quien visita (no por el tenant — eso es
 * `SettingsService`/`data-theme`, un eje distinto: la marca/paleta de la
 * tienda vs. el modo de color de quien mira). Se guarda en `localStorage`
 * (por dispositivo, no sincroniza entre visitas de otra persona).
 *
 * Aplica el atributo `data-mode` en `<html>`, que activa el variant
 * `dark:` de Tailwind (ver `@custom-variant dark` en `styles.css`).
 */
@Injectable({ providedIn: 'root' })
export class ThemeModeService {
  readonly isDark = signal(this.initial());

  constructor() {
    effect(() => {
      document.documentElement.setAttribute('data-mode', this.isDark() ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this.isDark.update((v) => !v);
    this.persist();
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, this.isDark() ? 'dark' : 'light');
    } catch {
      // localStorage puede fallar (modo privado, etc.) — no es crítico.
    }
  }

  private initial(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
    } catch {
      // ignorar, cae al default de abajo
    }
    return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  }
}
