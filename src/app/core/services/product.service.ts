import { Injectable, computed, inject, signal } from '@angular/core';
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
  /** Listado del panel, paginado (20 por página). */
  private readonly adminStore = new CollectionStore<Product>(
    this.http,
    '/admin/products',
    (raw) => raw as Product[],
    20
  );

  /** Solo activos — para el catálogo público */
  readonly availableProducts = this.publicStore.items;
  readonly catalogStatus = this.publicStore.status;
  readonly catalogLoading = this.publicStore.loading;
  readonly catalogErrored = this.publicStore.errored;
  readonly reloadCatalog = this.publicStore.reload;

  /** Página actual del panel (incluye inactivos) */
  readonly products = this.adminStore.items;
  readonly adminStatus = this.adminStore.status;
  readonly adminLoading = this.adminStore.loading;
  readonly adminErrored = this.adminStore.errored;
  readonly saving = this.adminStore.saving;
  readonly reloadAdmin = this.adminStore.reload;
  readonly adminPage = this.adminStore.page;
  readonly adminTotalPages = this.adminStore.totalPages;
  readonly adminTotalElements = this.adminStore.totalElements;
  loadAdminPage(n: number): void {
    this.adminStore.loadPage(n);
  }

  /** Fija los filtros del listado del panel (server-side) y recarga desde la página 0. */
  setAdminQuery(params: Record<string, string | number | null | undefined>): void {
    this.adminStore.setQuery(params);
  }

  /** Unión de ambas listas, sin duplicados (para getById desde cualquier contexto) */
  private readonly all = computed(() => {
    const map = new Map<string, Product>();
    for (const p of this.publicStore.items()) map.set(p.id, p);
    for (const p of this.adminStore.items()) map.set(p.id, p);
    return [...map.values()];
  });

  /** Los más vendidos (para la home). Se carga una vez al arrancar. */
  readonly bestSellers = signal<Product[]>([]);

  constructor() {
    this.publicStore.ensureLoaded();
    this.http.get<Product[]>(apiUrl('/products/best-sellers?limit=8')).subscribe({
      next: (list) => this.bestSellers.set(list),
      error: () => {},
    });
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

  /**
   * Detalle público de un producto (`GET /api/products/{id}`). A diferencia
   * del listado (`/api/products`, en `availableProducts`), trae la galería
   * completa (`images[]`) — el listado ya no la incluye (no se usa en las
   * tarjetas, ver `ProductDtos.PublicProductListResponse` en el backend), así
   * que la ficha de producto la pide aparte.
   */
  fetchOnePublic(id: string): Observable<Product> {
    return this.http.get<Product>(apiUrl(`/products/${id}`));
  }

  // --- Mutaciones (admin) ---

  create(input: ProductInput, onSuccess?: () => void): void {
    this.mutate(this.http.post(apiUrl('/admin/products'), input), onSuccess);
  }

  update(id: string, input: ProductInput, onSuccess?: () => void): void {
    this.mutate(this.http.put(apiUrl(`/admin/products/${id}`), input), onSuccess);
  }

  /**
   * Duplica un producto en el backend (copia todo salvo el stock, queda oculto)
   * y devuelve el producto nuevo. Recarga las listas al terminar.
   */
  duplicate(id: string): Observable<Product> {
    const req = this.http.post<Product>(apiUrl(`/admin/products/${id}/duplicate`), {});
    return new Observable<Product>((sub) => {
      const s = req.subscribe({
        next: (created) => {
          this.adminStore.reload();
          this.publicStore.load();
          sub.next(created);
          sub.complete();
        },
        error: (err) => sub.error(err),
      });
      return () => s.unsubscribe();
    });
  }

  delete(id: string): void {
    this.mutate(this.http.delete(apiUrl(`/admin/products/${id}`)));
  }

  /** Productos archivados (soft-delete). Lista aparte, no entra en el listado paginado. */
  fetchArchived(): Observable<Product[]> {
    return this.http.get<Product[]>(apiUrl('/admin/products/archived'));
  }

  /** Restaura un producto archivado (queda oculto: hay que republicarlo a mano). */
  restore(id: string, onSuccess?: () => void): void {
    this.mutate(this.http.post(apiUrl(`/admin/products/${id}/restore`), {}), onSuccess);
  }

  toggleActive(id: string): void {
    const p = this.getById(id);
    if (!p) return;
    this.mutate(this.http.patch(apiUrl(`/admin/products/${id}/active`), { active: !p.active }));
  }

  /** Marca (o desmarca) un producto como "no reponer" — sale de las alertas de stock bajo. */
  setDiscontinued(id: string, discontinued: boolean, onSuccess?: () => void): void {
    this.mutate(
      this.http.patch(apiUrl(`/admin/products/${id}/discontinued`), { discontinued }),
      onSuccess
    );
  }

  /** Ajuste manual de stock (pisa el número) — `note` opcional queda en el historial de movimientos. */
  setStock(id: string, size: string, stock: number, note?: string, onSuccess?: () => void): void {
    this.mutate(this.http.patch(apiUrl(`/admin/products/${id}/stock`), { size, stock, note }), onSuccess);
  }

  /** Registra una compra a proveedor: suma stock y recalcula el costo por promedio ponderado. */
  registerPurchase(
    id: string,
    input: { size: string; quantity: number; unitCost: number; supplierId?: string | null },
    onSuccess?: (product: Product) => void
  ): void {
    this.http.post<Product>(apiUrl(`/admin/products/${id}/purchase`), input).subscribe({
      next: (p) => {
        this.adminStore.reload();
        this.publicStore.load();
        onSuccess?.(p);
      },
      error: () => {},
    });
  }

  /** Busca un producto por código de barras (para "cargar por código" en el panel/POS). 404 si no existe. */
  findByBarcode(code: string): Observable<Product> {
    return this.http.get<Product>(apiUrl('/admin/products/by-barcode'), { params: { code } });
  }

  /** Genera un código interno (no pisa uno ya cargado). Recarga las listas al terminar. */
  generateBarcode(id: string, onSuccess?: (product: Product) => void): void {
    this.http.post<Product>(apiUrl(`/admin/products/${id}/generate-barcode`), {}).subscribe({
      next: (p) => {
        this.adminStore.reload();
        this.publicStore.load();
        onSuccess?.(p);
      },
      error: () => {},
    });
  }

  private mutate(obs: Observable<unknown>, onSuccess?: () => void): void {
    this.adminStore.mutate(obs, () => {
      this.publicStore.load();
      onSuccess?.();
    });
  }
}
