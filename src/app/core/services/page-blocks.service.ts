import { Injectable, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CollectionStore } from '../state/collection-store';

export interface PageBlockRecord {
  id: string;
  pageType: string;
  blockType: string;
  position: number;
  visible: boolean;
}

/**
 * Bloques visibles de la home (hoy: sólo "HERO"). Lee `/api/page-blocks`
 * (público, ya viene filtrado a sólo los visibles — ver PageBlockService en
 * el backend). Primer paso del personalizador visual (ver PLAN_SAAS.md
 * Fase 7): por ahora sólo permite mostrar/ocultar el bloque hero, sin
 * reordenar ni editor en el panel todavía.
 */
@Injectable({ providedIn: 'root' })
export class PageBlocksService {
  private readonly http = inject(HttpClient);
  private readonly store = new CollectionStore<PageBlockRecord>(this.http, '/page-blocks');

  readonly blocks = this.store.items;

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
}
