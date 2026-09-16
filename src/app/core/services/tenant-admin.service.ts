import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CollectionStore } from '../state/collection-store';
import { apiUrl } from '../config/site-config';

export interface TenantRecord {
  id: string;
  slug: string;
  name: string;
  rubro: string;
  rubroLabel: string;
  active: boolean;
  createdAt: string;
}

export interface RubroOption {
  value: string;
  label: string;
}

export interface TenantCreateRequest {
  name: string;
  slug: string;
  rubro: string;
  /**
   * Lo que haya elegido el asistente ANTES de crear la tienda (ver
   * PLAN_SAAS.md Fase 10) — diseño, color, identidad. Todo opcional: vacío
   * u omitido = quedan los defaults del rubro (mismo comportamiento que
   * antes de que existiera el asistente).
   */
  layout?: string;
  brandColor?: string;
  /** Colores independientes del color de marca (ver PLAN_SAAS.md Fase 10 ampliada) — todos opcionales. */
  headerColor?: string;
  footerColor?: string;
  textColor?: string;
  pageBackgroundColor?: string;
  whatsappNumber?: string;
  instagram?: string;
  facebookUrl?: string;
  logoUrl?: string;
  /** Forma del logo (`circle` | `square` | `rectangle`, ver PLAN_SAAS.md Fase 10). */
  logoShape?: string;
}

/**
 * Alta y listado de tiendas (tenants) — sólo superadmin (ver
 * `TenantController` en el backend). Pensado para el asistente "Crear
 * tienda" del panel (PLAN_SAAS.md Fase 9).
 */
@Injectable({ providedIn: 'root' })
export class TenantAdminService {
  private readonly http = inject(HttpClient);
  private readonly store = new CollectionStore<TenantRecord>(this.http, '/admin/tenants');
  private readonly savingSignal = signal(false);

  readonly tenants = this.store.items;
  readonly status = this.store.status;
  readonly saving = this.savingSignal.asReadonly();
  readonly reload = this.store.reload;

  ensureLoaded(): void {
    this.store.ensureLoaded();
  }

  rubros() {
    return this.http.get<RubroOption[]>(apiUrl('/admin/tenants/rubros'));
  }

  /** Crea la tienda; en éxito recarga el listado y avisa con la tienda creada (para poder navegar a verla). */
  create(req: TenantCreateRequest, onSuccess: (tenant: TenantRecord) => void, onError?: () => void): void {
    this.savingSignal.set(true);
    this.http.post<TenantRecord>(apiUrl('/admin/tenants'), req).subscribe({
      next: (tenant) => {
        this.savingSignal.set(false);
        this.store.reload();
        onSuccess(tenant);
      },
      error: () => {
        this.savingSignal.set(false);
        onError?.();
      },
    });
  }

  /**
   * Pausa (deja de poder verse el storefront, ver `TenantResolutionFilter`)
   * o reanuda una tienda. El panel de administración de esa tienda sigue
   * accesible siempre, pausada o no — es sólo el sitio público el que se cierra.
   */
  setActive(id: string, active: boolean, onSuccess?: () => void, onError?: () => void): void {
    this.http.patch<TenantRecord>(apiUrl(`/admin/tenants/${id}/active`), { active }).subscribe({
      next: () => {
        this.store.reload();
        onSuccess?.();
      },
      error: () => onError?.(),
    });
  }

  /**
   * Borrado permanente e irreversible de la tienda y todos sus datos (ver
   * backend `TenantDeletionService`). `confirmSlug` tiene que ser
   * exactamente el slug de la tienda — el backend lo vuelve a validar, así
   * que esto no depende sólo de que el frontend lo haya chequeado antes.
   */
  deleteTenant(id: string, confirmSlug: string, onSuccess?: () => void, onError?: (message?: string) => void): void {
    this.http.post(apiUrl(`/admin/tenants/${id}/delete`), { confirmSlug }).subscribe({
      next: () => {
        this.store.reload();
        onSuccess?.();
      },
      error: (err) => onError?.(err?.error?.message),
    });
  }
}
