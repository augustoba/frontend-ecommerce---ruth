import { Injectable, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ParamGroup, ParamOption } from '../models/param.model';
import { CollectionStore } from '../state/collection-store';
import { apiUrl } from '../config/site-config';

/**
 * Parametrías (grupos + opciones). Los lee de `/api/param-groups` (público) y
 * el CRUD va contra `/api/admin/param-groups/**`. Tras cada cambio recarga la
 * lista para no divergir del backend.
 */
@Injectable({ providedIn: 'root' })
export class ParamService {
  private readonly http = inject(HttpClient);
  private readonly store = new CollectionStore<ParamGroup>(this.http, '/param-groups');

  readonly groups = this.store.items;
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

  /** Grupos que se muestran como filtro en el catálogo público */
  readonly catalogGroups = computed(() => this.groups().filter((g) => g.showInCatalog));

  getGroup(id: string): ParamGroup | undefined {
    return this.groups().find((g) => g.id === id);
  }

  getOption(groupId: string, optionId: string): ParamOption | undefined {
    return this.getGroup(groupId)?.options.find((o) => o.id === optionId);
  }

  /** Etiqueta legible de una opción (ej: "Bebé"), o '' si ya no existe */
  labelFor(groupId: string, optionId: string): string {
    return this.getOption(groupId, optionId)?.label ?? '';
  }

  // --- Grupos ---

  addGroup(name: string, opts: { multiple: boolean; showInCatalog: boolean }): void {
    this.store.mutate(this.http.post(apiUrl('/admin/param-groups'), { name, ...opts }));
  }

  updateGroup(
    id: string,
    patch: Partial<Pick<ParamGroup, 'name' | 'multiple' | 'showInCatalog'>>
  ): void {
    const g = this.getGroup(id);
    if (!g) return;
    this.store.mutate(
      this.http.put(apiUrl(`/admin/param-groups/${id}`), {
        name: patch.name ?? g.name,
        multiple: patch.multiple ?? g.multiple,
        showInCatalog: patch.showInCatalog ?? g.showInCatalog,
      })
    );
  }

  removeGroup(id: string): void {
    this.store.mutate(this.http.delete(apiUrl(`/admin/param-groups/${id}`)));
  }

  // --- Opciones ---

  addOption(groupId: string, label: string): void {
    const clean = label.trim();
    if (!clean) return;
    this.store.mutate(this.http.post(apiUrl(`/admin/param-groups/${groupId}/options`), { label: clean }));
  }

  updateOption(groupId: string, optionId: string, label: string): void {
    const clean = label.trim();
    if (!clean) return;
    this.store.mutate(
      this.http.put(apiUrl(`/admin/param-groups/${groupId}/options/${optionId}`), { label: clean })
    );
  }

  removeOption(groupId: string, optionId: string): void {
    this.store.mutate(this.http.delete(apiUrl(`/admin/param-groups/${groupId}/options/${optionId}`)));
  }
}
