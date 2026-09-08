import { Injectable, signal } from '@angular/core';
import { SizeScale, defaultSizeScales } from '../models/size-scale.model';

const STORAGE_KEY = 'pp_size_scales';

/**
 * Escalas de talle editables (ropa bebé / niños / adultos, calzado, …).
 * Mismo patrón que ParamService / SupplierService: signal + localStorage.
 */
@Injectable({ providedIn: 'root' })
export class SizeScaleService {
  private readonly scalesSignal = signal<SizeScale[]>(this.loadInitial());

  readonly scales = this.scalesSignal.asReadonly();

  getById(id: string | undefined): SizeScale | undefined {
    if (!id) return undefined;
    return this.scalesSignal().find((s) => s.id === id);
  }

  /** Talles de una escala (o [] si no existe) */
  valuesFor(id: string | undefined): string[] {
    return this.getById(id)?.values ?? [];
  }

  // --- Escalas ---

  add(name: string): SizeScale {
    const scale: SizeScale = {
      id: `escala-${slug(name)}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      values: [],
      system: false,
      createdAt: new Date().toISOString(),
    };
    this.scalesSignal.update((list) => [...list, scale]);
    this.persist();
    return scale;
  }

  updateName(id: string, name: string): void {
    const clean = name.trim();
    if (!clean) return;
    this.scalesSignal.update((list) =>
      list.map((s) => (s.id === id ? { ...s, name: clean } : s))
    );
    this.persist();
  }

  remove(id: string): void {
    this.scalesSignal.update((list) => list.filter((s) => s.id !== id || s.system));
    this.persist();
  }

  // --- Valores ---

  addValue(id: string, value: string): void {
    const clean = value.trim();
    if (!clean) return;
    this.scalesSignal.update((list) =>
      list.map((s) =>
        s.id === id && !s.values.includes(clean)
          ? { ...s, values: [...s.values, clean] }
          : s
      )
    );
    this.persist();
  }

  renameValue(id: string, oldValue: string, newValue: string): void {
    const clean = newValue.trim();
    if (!clean) return;
    this.scalesSignal.update((list) =>
      list.map((s) =>
        s.id === id
          ? { ...s, values: s.values.map((v) => (v === oldValue ? clean : v)) }
          : s
      )
    );
    this.persist();
  }

  removeValue(id: string, value: string): void {
    this.scalesSignal.update((list) =>
      list.map((s) => (s.id === id ? { ...s, values: s.values.filter((v) => v !== value) } : s))
    );
    this.persist();
  }

  resetToDefaults(): void {
    this.scalesSignal.set(defaultSizeScales());
    this.persist();
  }

  private loadInitial(): SizeScale[] {
    if (typeof localStorage === 'undefined') return defaultSizeScales();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultSizeScales();
      const parsed = JSON.parse(raw) as SizeScale[];
      return Array.isArray(parsed) && parsed.length ? parsed : defaultSizeScales();
    } catch {
      return defaultSizeScales();
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.scalesSignal()));
  }
}

function slug(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 24) || 'x'
  );
}
