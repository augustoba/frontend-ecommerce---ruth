import { Injectable, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductInput } from '../models/product.model';
import { CollectionStore } from '../state/collection-store';
import { apiUrl } from '../config/site-config';

/**
 * Catálogo. Dos listas:
 *  - pública (`/api/products`, solo activos) → `availableProducts`, para la tienda.
 *  - admin (`/api/admin/products`, todos) → `products`, para el panel.
 * Tras cada mutación se recargan las dos.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  private readonly publicStore = new CollectionStore<Product>(this.http, '/products');
  private readonly adminStore = new CollectionStore<Product>(this.http, '/admin/products');

  /** Solo activos — para el catálogo público */
  readonly availableProducts = this.publicStore.items;
  readonly catalogStatus = this.publicStore.status;
  readonly catalogLoading = this.publicStore.loading;
  readonly catalogErrored = this.publicStore.errored;
  readonly reloadCatalog = this.publicStore.reload;

  /** Todos, incluidos inactivos — para el panel de admin */
  readonly products = this.adminStore.items;
  readonly adminStatus = this.adminStore.status;
  readonly adminLoading = this.adminStore.loading;
  readonly adminErrored = this.adminStore.errored;
  readonly saving = this.adminStore.saving;
  readonly reloadAdmin = this.adminStore.reload;

  /** Unión de ambas listas, sin duplicados (para getById desde cualquier contexto) */
  private readonly all = computed(() => {
    const map = new Map<string, Product>();
    for (const p of this.publicStore.items()) map.set(p.id, p);
    for (const p of this.adminStore.items()) map.set(p.id, p);
    return [...map.values()];
  });

  constructor() {
    this.publicStore.ensureLoaded();
  }

  /** Carga la lista completa (panel). Llamar al entrar a una pantalla de admin. */
  ensureAdminLoaded(): void {
    this.adminStore.ensureLoaded();
  }

  getById(id: string): Product | undefined {
    return this.all().find((p) => p.id === id);
  }

  /** Trae un producto puntual del backend (para el resolver del form de edición). */
  fetchOne(id: string): Observable<Product> {
    return this.http.get<Product>(apiUrl(`/admin/products/${id}`));
  }

  // --- Mutaciones (admin) ---

  create(input: ProductInput, onSuccess?: () => void): void {
    this.mutate(this.http.post(apiUrl('/admin/products'), input), onSuccess);
  }

  update(id: string, input: ProductInput, onSuccess?: () => void): void {
    this.mutate(this.http.put(apiUrl(`/admin/products/${id}`), input), onSuccess);
  }

  delete(id: string): void {
    this.mutate(this.http.delete(apiUrl(`/admin/products/${id}`)));
  }

  toggleActive(id: string): void {
    const p = this.getById(id);
    if (!p) return;
    this.mutate(this.http.patch(apiUrl(`/admin/products/${id}/active`), { active: !p.active }));
  }

  setStock(id: string, size: string, stock: number): void {
    this.mutate(this.http.patch(apiUrl(`/admin/products/${id}/stock`), { size, stock }));
  }

  private mutate(obs: Observable<unknown>, onSuccess?: () => void): void {
    this.adminStore.mutate(obs, () => {
      this.publicStore.load();
      onSuccess?.();
    });
  }
}
