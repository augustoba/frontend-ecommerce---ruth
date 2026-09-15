import { Injectable, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CollectionStore } from '../state/collection-store';
import { apiUrl } from '../config/site-config';

export interface PageBlockRecord {
  id: string;
  pageType: string;
  blockType: string;
  position: number;
  visible: boolean;
}

/** Nombre legible de cada tipo de bloque, para el panel. */
export const BLOCK_LABELS: Record<string, string> = {
  HERO: 'Carrusel de fotos (hero)',
  FEATURED_PRODUCTS: 'Lo más vendido',
};

/**
 * Bloques de la home (hoy: sólo "HERO"). El sitio público lee
 * `/api/page-blocks` (ya viene filtrado a sólo los visibles); el panel usa
 * `/api/admin/page-blocks` (todos, visibles u ocultos) para poder
 * mostrar/ocultar. Primer paso del personalizador visual (ver
 * PLAN_SAAS.md Fase 7): por ahora sólo permite mostrar/ocultar el bloque
 * hero, sin reordenar ni más tipos de bloque todavía.
 */
@Injectable({ providedIn: 'root' })
export class PageBlocksService {
  private readonly http = inject(HttpClient);
  private readonly store = new CollectionStore<PageBlockRecord>(this.http, '/page-blocks');
  private readonly adminStore = new CollectionStore<PageBlockRecord>(this.http, '/admin/page-blocks');

  readonly blocks = this.store.items;

  readonly adminBlocks = this.adminStore.items;
  readonly adminStatus = this.adminStore.status;
  readonly adminSaving = this.adminStore.saving;
  readonly adminReload = this.adminStore.reload;

  constructor() {
    this.store.ensureLoaded();
  }

  /**
   * true si el bloque está visible. Mientras no haya cargado (o si falla),
   * asume visible — evita ocultar contenido por un error de red.
   */
  isVisible(blockType: string) {
    return computed(() => {
      if (this.store.status() !== 'loaded') return true;
      return this.blocks().some((b) => b.blockType === blockType);
    });
  }

  ensureAdminLoaded(): void {
    this.adminStore.ensureLoaded();
  }

  setVisible(id: string, visible: boolean): void {
    this.adminStore.mutate(this.http.put(apiUrl(`/admin/page-blocks/${id}/visible`), { visible }));
  }
}
