import { computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../config/site-config';

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface PagedRaw {
  content: unknown;
  page: number;
  totalPages: number;
  totalElements: number;
}

/**
 * Contenedor genérico para un listado que viene del backend, con estado de
 * carga/error y de "guardando". Cada service compone uno y expone
 * `items` / `status` / `saving` / `reload`, sin repetir la lógica.
 *
 * Si se pasa `pageSize > 0`, el listado se pagina: `loadPage(n)` pide
 * `?page=n&size=pageSize` y espera una respuesta `{ content, page, totalPages,
 * totalElements }`. `page` / `totalPages` / `totalElements` quedan expuestos.
 */
export class CollectionStore<T> {
  private readonly itemsSignal = signal<T[]>([]);
  private readonly statusSignal = signal<LoadStatus>('idle');
  private readonly savingSignal = signal(false);
  private readonly pageSignal = signal(0);
  private readonly totalPagesSignal = signal(1);
  private readonly totalElementsSignal = signal(0);

  readonly items = this.itemsSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly saving = this.savingSignal.asReadonly();
  readonly loading = computed(() => this.statusSignal() === 'loading');
  readonly errored = computed(() => this.statusSignal() === 'error');
  /** true una vez que cargó al menos una vez */
  readonly ready = computed(() => this.statusSignal() === 'loaded');

  /** Paginación (sólo si `pageSize > 0`). `page` es 0-based. */
  readonly page = this.pageSignal.asReadonly();
  readonly totalPages = this.totalPagesSignal.asReadonly();
  readonly totalElements = this.totalElementsSignal.asReadonly();

  /** Reejecuta la última carga (página actual si está paginado). */
  private lastLoad: () => void = () => this.load();

  /**
   * @param path      ruta relativa, ej '/products' → GET /api/products
   * @param pick      opcional: extrae el array de la respuesta (si viene envuelto)
   * @param pageSize  > 0 → listado paginado (usa `loadPage`)
   */
  constructor(
    private readonly http: HttpClient,
    private readonly path: string,
    private readonly pick: (raw: unknown) => T[] = (raw) => raw as T[],
    private readonly pageSize = 0
  ) {}

  /** Carga si nunca se cargó (o si el último intento falló). */
  ensureLoaded(): void {
    if (this.statusSignal() === 'idle' || this.statusSignal() === 'error') {
      if (this.pageSize > 0) this.loadPage(this.pageSignal());
      else this.load();
    }
  }

  load(): void {
    this.lastLoad = () => this.load();
    this.statusSignal.set('loading');
    this.http.get<unknown>(apiUrl(this.path)).subscribe({
      next: (raw) => {
        this.itemsSignal.set(this.pick(raw));
        this.statusSignal.set('loaded');
      },
      error: () => this.statusSignal.set('error'),
    });
  }

  /** Carga la página `n` (0-based). Requiere `pageSize > 0`. */
  loadPage(n: number): void {
    const target = Math.max(0, n);
    this.lastLoad = () => this.loadPage(target);
    this.pageSignal.set(target);
    this.statusSignal.set('loading');
    this.http
      .get<PagedRaw>(apiUrl(this.path), {
        params: { page: target, size: this.pageSize },
      })
      .subscribe({
        next: (raw) => {
          this.itemsSignal.set(this.pick(raw.content));
          this.totalPagesSignal.set(raw.totalPages ?? 1);
          this.totalElementsSignal.set(raw.totalElements ?? 0);
          this.pageSignal.set(raw.page ?? target);
          this.statusSignal.set('loaded');
        },
        error: () => this.statusSignal.set('error'),
      });
  }

  reload = (): void => this.lastLoad();

  /**
   * Ejecuta una mutación (POST/PUT/DELETE), marca `saving`, y al terminar bien
   * recarga la lista (la página actual si está paginado). Los errores los
   * muestra el errorInterceptor (toast).
   */
  mutate(obs: Observable<unknown>, onSuccess?: () => void): void {
    this.savingSignal.set(true);
    obs.subscribe({
      next: () => {
        this.savingSignal.set(false);
        this.lastLoad();
        onSuccess?.();
      },
      error: () => this.savingSignal.set(false),
    });
  }

  setItems(items: T[]): void {
    this.itemsSignal.set(items);
    this.statusSignal.set('loaded');
  }
}
