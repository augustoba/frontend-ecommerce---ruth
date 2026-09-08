import { Injectable, computed, signal } from '@angular/core';
import { ParamGroup, ParamOption } from '../models/param.model';

const STORAGE_KEY = 'pp_param_groups';

/** Parametrías por defecto. IDs estables (no randomUUID) para que la
 *  migración de productos viejos y los datos de ejemplo sean deterministas. */
function defaultGroups(): ParamGroup[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'grp-publico',
      name: 'Público',
      multiple: false,
      showInCatalog: true,
      system: true,
      createdAt: now,
      options: [
        { id: 'publico-bebe', label: 'Bebé' },
        { id: 'publico-nena', label: 'Nena' },
        { id: 'publico-nene', label: 'Nene' },
        { id: 'publico-unisex', label: 'Unisex' },
      ],
    },
    {
      id: 'grp-tipo',
      name: 'Tipo de prenda',
      multiple: false,
      showInCatalog: true,
      system: false,
      createdAt: now,
      options: [
        { id: 'tipo-remera', label: 'Remera' },
        { id: 'tipo-buzo', label: 'Buzo / Campera' },
        { id: 'tipo-pantalon', label: 'Pantalón' },
        { id: 'tipo-jean', label: 'Jean' },
        { id: 'tipo-vestido', label: 'Vestido / Pollera' },
        { id: 'tipo-body', label: 'Body / Enterito' },
        { id: 'tipo-conjunto', label: 'Conjunto' },
        { id: 'tipo-calzado', label: 'Calzado' },
        { id: 'tipo-accesorio', label: 'Accesorio' },
      ],
    },
    {
      id: 'grp-estacion',
      name: 'Estación',
      multiple: true,
      showInCatalog: true,
      system: false,
      createdAt: now,
      options: [
        { id: 'estacion-primavera', label: 'Primavera' },
        { id: 'estacion-verano', label: 'Verano' },
        { id: 'estacion-otono', label: 'Otoño' },
        { id: 'estacion-invierno', label: 'Invierno' },
        { id: 'estacion-todo', label: 'Todo el año' },
      ],
    },
  ];
}

/** Genera un id legible y único a partir de un texto
 *  (ej: "Talle real" → "talle-real-x3k9") */
function slugId(prefix: string, label: string): string {
  const base = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 24);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${base || 'x'}-${rand}`;
}

/**
 * Administra las parametrías (grupos + opciones). Mismo patrón que
 * ProductService/PromoService: signal + localStorage, sin backend todavía.
 */
@Injectable({ providedIn: 'root' })
export class ParamService {
  private readonly groupsSignal = signal<ParamGroup[]>(this.loadInitial());

  readonly groups = this.groupsSignal.asReadonly();

  /** Grupos que se muestran como filtro en el catálogo público */
  readonly catalogGroups = computed(() => this.groupsSignal().filter((g) => g.showInCatalog));

  getGroup(id: string): ParamGroup | undefined {
    return this.groupsSignal().find((g) => g.id === id);
  }

  getOption(groupId: string, optionId: string): ParamOption | undefined {
    return this.getGroup(groupId)?.options.find((o) => o.id === optionId);
  }

  /** Etiqueta legible de una opción (ej: "Bebé"), o '' si ya no existe */
  labelFor(groupId: string, optionId: string): string {
    return this.getOption(groupId, optionId)?.label ?? '';
  }

  // --- Grupos ---

  addGroup(name: string, opts: { multiple: boolean; showInCatalog: boolean }): ParamGroup {
    const group: ParamGroup = {
      id: slugId('grp', name),
      name: name.trim(),
      multiple: opts.multiple,
      showInCatalog: opts.showInCatalog,
      system: false,
      options: [],
      createdAt: new Date().toISOString(),
    };
    this.groupsSignal.update((list) => [...list, group]);
    this.persist();
    return group;
  }

  updateGroup(
    id: string,
    patch: Partial<Pick<ParamGroup, 'name' | 'multiple' | 'showInCatalog'>>
  ): void {
    this.groupsSignal.update((list) =>
      list.map((g) =>
        g.id === id
          ? { ...g, ...patch, name: (patch.name ?? g.name).trim() || g.name }
          : g
      )
    );
    this.persist();
  }

  /** Elimina un grupo (los de sistema no se pueden borrar) */
  removeGroup(id: string): void {
    this.groupsSignal.update((list) => list.filter((g) => g.id !== id || g.system));
    this.persist();
  }

  // --- Opciones ---

  addOption(groupId: string, label: string): void {
    const clean = label.trim();
    if (!clean) return;
    this.groupsSignal.update((list) =>
      list.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: [
                ...g.options,
                { id: slugId(groupId.replace(/^grp-/, ''), clean), label: clean },
              ],
            }
          : g
      )
    );
    this.persist();
  }

  updateOption(groupId: string, optionId: string, label: string): void {
    const clean = label.trim();
    if (!clean) return;
    this.groupsSignal.update((list) =>
      list.map((g) =>
        g.id === groupId
          ? { ...g, options: g.options.map((o) => (o.id === optionId ? { ...o, label: clean } : o)) }
          : g
      )
    );
    this.persist();
  }

  removeOption(groupId: string, optionId: string): void {
    this.groupsSignal.update((list) =>
      list.map((g) =>
        g.id === groupId ? { ...g, options: g.options.filter((o) => o.id !== optionId) } : g
      )
    );
    this.persist();
  }

  resetToDefaults(): void {
    this.groupsSignal.set(defaultGroups());
    this.persist();
  }

  private loadInitial(): ParamGroup[] {
    if (typeof localStorage === 'undefined') return defaultGroups();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultGroups();
      const parsed = JSON.parse(raw) as ParamGroup[];
      return Array.isArray(parsed) && parsed.length ? parsed : defaultGroups();
    } catch {
      return defaultGroups();
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.groupsSignal()));
  }
}
