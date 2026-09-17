import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CollectionStore } from '../state/collection-store';
import { apiUrl } from '../config/site-config';

export type BusinessModel = 'ECOMMERCE' | 'POS';

export interface PlanRecord {
  id: string;
  slug: string;
  name: string;
  /** Fijo, no se edita — determina qué módulos son compatibles (ver `compatibleModules`). */
  businessModel: BusinessModel;
  /** null = sin límite. */
  maxProducts: number | null;
  maxAdminUsers: number | null;
  enabledModules: string[];
  /** Únicos módulos que tiene sentido tildar para este plan (ver `Modules.compatibleWith` en el backend). */
  compatibleModules: string[];
  showPlatformBranding: boolean;
  /** Cuántas tiendas usan este plan hoy. */
  tenantCount: number;
}

export interface PlanUpdateRequest {
  name: string;
  maxProducts: number | null;
  maxAdminUsers: number | null;
  enabledModules: string[];
  showPlatformBranding: boolean;
}

/**
 * ABM de planes comerciales — sólo superadmin (ver `PlanController` en el
 * backend). Reemplaza el `UPDATE` a mano en `plan_module` que se usaba
 * hasta ahora para prender/apagar módulos por plan (ver PLAN_SAAS.md).
 */
@Injectable({ providedIn: 'root' })
export class PlanAdminService {
  private readonly http = inject(HttpClient);
  private readonly store = new CollectionStore<PlanRecord>(this.http, '/admin/plans');

  readonly plans = this.store.items;
  readonly status = this.store.status;
  readonly saving = this.store.saving;

  ensureLoaded(): void {
    this.store.ensureLoaded();
  }

  reload(): void {
    this.store.reload();
  }

  update(id: string, req: PlanUpdateRequest, onSuccess?: () => void): void {
    this.store.mutate(this.http.put(apiUrl(`/admin/plans/${id}`), req), onSuccess);
  }
}
