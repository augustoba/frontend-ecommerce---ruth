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
}
