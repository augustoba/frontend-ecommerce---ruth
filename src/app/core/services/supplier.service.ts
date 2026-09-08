import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Supplier, SupplierInput } from '../models/supplier.model';
import { CollectionStore } from '../state/collection-store';
import { apiUrl } from '../config/site-config';

/**
 * Proveedores del local (info interna del admin). Todo contra
 * `/api/admin/suppliers/**`. Se carga al entrar a una pantalla que lo necesite
 * (`ensureLoaded()`), no al arrancar la app.
 */
@Injectable({ providedIn: 'root' })
export class SupplierService {
  private readonly http = inject(HttpClient);
  private readonly store = new CollectionStore<Supplier>(this.http, '/admin/suppliers');

  readonly suppliers = this.store.items;
  readonly status = this.store.status;
  readonly loading = this.store.loading;
  readonly errored = this.store.errored;
  readonly saving = this.store.saving;
  readonly reload = this.store.reload;

  ensureLoaded(): void {
    this.store.ensureLoaded();
  }

  getById(id: string | undefined): Supplier | undefined {
    if (!id) return undefined;
    return this.suppliers().find((s) => s.id === id);
  }

  /** Nombre del proveedor, o '' si no tiene / fue eliminado */
  nameFor(id: string | undefined): string {
    return this.getById(id)?.name ?? '';
  }

  add(input: SupplierInput): void {
    this.store.mutate(this.http.post(apiUrl('/admin/suppliers'), input));
  }

  update(id: string, input: SupplierInput): void {
    this.store.mutate(this.http.put(apiUrl(`/admin/suppliers/${id}`), input));
  }

  remove(id: string): void {
    this.store.mutate(this.http.delete(apiUrl(`/admin/suppliers/${id}`)));
  }
}
