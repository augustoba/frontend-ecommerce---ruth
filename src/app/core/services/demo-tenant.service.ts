import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'demo-tenant-slug';

/**
 * Selector de tienda "modo demo" (ver PLAN_SAAS.md Fase 9 y
 * `TenantResolutionFilter` en el backend): guarda qué tenant se está
 * mirando en esta pestaña y expone el slug para que `demoTenantInterceptor`
 * lo mande como header `X-Demo-Tenant` en cada request. `sessionStorage`
 * (no `localStorage`): cada pestaña puede estar viendo una tienda
 * distinta, y no queda pegado entre sesiones. `null` = tienda por defecto
 * del deploy (sin header, resolución normal).
 */
@Injectable({ providedIn: 'root' })
export class DemoTenantService {
  private readonly slugSignal = signal<string | null>(readInitial());

  readonly slug = this.slugSignal.asReadonly();

  view(slug: string): void {
    this.slugSignal.set(slug);
    try {
      sessionStorage.setItem(STORAGE_KEY, slug);
    } catch {
      // Storage no disponible (modo privado, etc.) — igual funciona en memoria para esta carga.
    }
  }

  clear(): void {
    this.slugSignal.set(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ver comentario de arriba
    }
  }
}

function readInitial(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
