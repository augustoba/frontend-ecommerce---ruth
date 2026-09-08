import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CollectionStore } from '../state/collection-store';
import { apiUrl } from '../config/site-config';

export interface HeroSlideRecord {
  id: string;
  imageUrl: string;
  alt: string;
}

/**
 * Fotos del carrusel de la home. Lee de `/api/hero-slides` (público); el CRUD
 * va contra `/api/admin/hero-slides/**`. Las fotos subidas por archivo se
 * redimensionan client-side (ver `resizeImageFile`) y se mandan como data URL.
 */
@Injectable({ providedIn: 'root' })
export class HeroSlidesService {
  private readonly http = inject(HttpClient);
  private readonly store = new CollectionStore<HeroSlideRecord>(this.http, '/hero-slides');

  readonly slides = this.store.items;
  readonly status = this.store.status;
  readonly loading = this.store.loading;
  readonly errored = this.store.errored;
  readonly saving = this.store.saving;
  readonly reload = this.store.reload;

  constructor() {
    this.store.ensureLoaded();
  }

  ensureLoaded(): void {
    this.store.ensureLoaded();
  }

  add(imageUrl: string, alt: string): void {
    this.store.mutate(
      this.http.post(apiUrl('/admin/hero-slides'), { imageUrl, alt: alt.trim() })
    );
  }

  updateAlt(id: string, alt: string): void {
    const slide = this.slides().find((s) => s.id === id);
    if (!slide) return;
    this.store.mutate(
      this.http.put(apiUrl(`/admin/hero-slides/${id}`), { imageUrl: slide.imageUrl, alt })
    );
  }

  remove(id: string): void {
    this.store.mutate(this.http.delete(apiUrl(`/admin/hero-slides/${id}`)));
  }

  /** Mueve una foto una posición hacia arriba (-1) o abajo (+1) */
  move(id: string, direction: -1 | 1): void {
    const list = this.slides();
    const index = list.findIndex((s) => s.id === id);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= list.length) return;
    const ids = list.map((s) => s.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    this.store.mutate(this.http.put(apiUrl('/admin/hero-slides/reorder'), { ids }));
  }
}
