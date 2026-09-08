import { Injectable, signal } from '@angular/core';
import { Supplier, SupplierInput } from '../models/supplier.model';

const STORAGE_KEY = 'pp_suppliers';

/**
 * Proveedores del local (info interna del admin). Mismo patrón que
 * ParamService / DiscountService: signal + localStorage, sin backend todavía.
 * Arranca vacío — no hay proveedores de ejemplo.
 */
@Injectable({ providedIn: 'root' })
export class SupplierService {
  private readonly suppliersSignal = signal<Supplier[]>(this.loadInitial());

  readonly suppliers = this.suppliersSignal.asReadonly();

  getById(id: string | undefined): Supplier | undefined {
    if (!id) return undefined;
    return this.suppliersSignal().find((s) => s.id === id);
  }

  /** Nombre del proveedor, o '' si no tiene / fue eliminado */
  nameFor(id: string | undefined): string {
    return this.getById(id)?.name ?? '';
  }

  add(input: SupplierInput): Supplier {
    const supplier: Supplier = {
      ...this.clean(input),
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.suppliersSignal.update((list) => [...list, supplier]);
    this.persist();
    return supplier;
  }

  update(id: string, input: SupplierInput): void {
    this.suppliersSignal.update((list) =>
      list.map((s) => (s.id === id ? { ...s, ...this.clean(input) } : s))
    );
    this.persist();
  }

  remove(id: string): void {
    this.suppliersSignal.update((list) => list.filter((s) => s.id !== id));
    this.persist();
  }

  private clean(input: SupplierInput): SupplierInput {
    return {
      name: input.name.trim(),
      phone: input.phone?.trim() || undefined,
      address: input.address?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
    };
  }

  private loadInitial(): Supplier[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Supplier[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.suppliersSignal()));
  }
}
