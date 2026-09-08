import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SizeScale } from '../models/size-scale.model';
import { CollectionStore } from '../state/collection-store';
import { apiUrl } from '../config/site-config';

/**
 * Escalas de talle. Lee de `/api/size-scales` (público); CRUD contra
 * `/api/admin/size-scales/**`. Los valores de una escala se editan mandando la
 * lista completa a `PUT /{id}/values`.
 */
@Injectable({ providedIn: 'root' })
export class SizeScaleService {
  private readonly http = inject(HttpClient);
  private readonly store = new CollectionStore<SizeScale>(this.http, '/size-scales');

  readonly scales = this.store.items;
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

  getById(id: string | undefined): SizeScale | undefined {
    if (!id) return undefined;
    return this.scales().find((s) => s.id === id);
  }

  /** Talles de una escala (o [] si no existe) */
  valuesFor(id: string | undefined): string[] {
    return this.getById(id)?.values ?? [];
  }

  // --- Escalas ---

  add(name: string): void {
    const clean = name.trim();
    if (!clean) return;
    this.store.mutate(this.http.post(apiUrl('/admin/size-scales'), { name: clean, values: [] }));
  }

  updateName(id: string, name: string): void {
    const clean = name.trim();
    if (!clean) return;
    this.store.mutate(this.http.put(apiUrl(`/admin/size-scales/${id}`), { name: clean }));
  }

  remove(id: string): void {
    this.store.mutate(this.http.delete(apiUrl(`/admin/size-scales/${id}`)));
  }

  // --- Valores (se manda la lista completa) ---

  addValue(id: string, value: string): void {
    const clean = value.trim();
    const current = this.valuesFor(id);
    if (!clean || current.includes(clean)) return;
    this.replaceValues(id, [...current, clean]);
  }

  renameValue(id: string, oldValue: string, newValue: string): void {
    const clean = newValue.trim();
    if (!clean) return;
    this.replaceValues(
      id,
      this.valuesFor(id).map((v) => (v === oldValue ? clean : v))
    );
  }

  removeValue(id: string, value: string): void {
    this.replaceValues(
      id,
      this.valuesFor(id).filter((v) => v !== value)
    );
  }

  private replaceValues(id: string, values: string[]): void {
    this.store.mutate(this.http.put(apiUrl(`/admin/size-scales/${id}/values`), { values }));
  }
}
