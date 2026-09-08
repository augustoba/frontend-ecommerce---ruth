import { computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../config/site-config';

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Contenedor genérico para un listado que viene del backend, con estado de
 * carga/error y de "guardando". Cada service compone uno y expone
 * `items` / `status` / `saving` / `reload`, sin repetir la lógica.
 */
export class CollectionStore<T> {
  private readonly itemsSignal = signal<T[]>([]);
  private readonly statusSignal = signal<LoadStatus>('idle');
  private readonly savingSignal = signal(false);

  readonly items = this.itemsSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly saving = this.savingSignal.asReadonly();
  readonly loading = computed(() => this.statusSignal() === 'loading');
  readonly errored = computed(() => this.statusSignal() === 'error');
  /** true una vez que cargó al menos una vez */
  readonly ready = computed(() => this.statusSignal() === 'loaded');

  /**
   * @param path  ruta relativa, ej '/products' → GET /api/products
   * @param pick  opcional: extrae el array de la respuesta (si viene envuelto)
   */
  constructor(
    private readonly http: HttpClient,
    private readonly path: string,
    private readonly pick: (raw: unknown) => T[] = (raw) => raw as T[]
  ) {}

  /** Carga si nunca se cargó (o si el último intento falló). */
  ensureLoaded(): void {
    if (this.statusSignal() === 'idle' || this.statusSignal() === 'error') {
      this.load();
    }
  }

  load(): void {
    this.statusSignal.set('loading');
    this.http.get<unknown>(apiUrl(this.path)).subscribe({
      next: (raw) => {
        this.itemsSignal.set(this.pick(raw));
        this.statusSignal.set('loaded');
      },
      error: () => this.statusSignal.set('error'),
    });
  }

  reload = (): void => this.load();

  /**
   * Ejecuta una mutación (POST/PUT/DELETE), marca `saving`, y al terminar bien
   * recarga la lista. Los errores los muestra el errorInterceptor (toast).
   */
  mutate(obs: Observable<unknown>, onSuccess?: () => void): void {
    this.savingSignal.set(true);
    obs.subscribe({
      next: () => {
        this.savingSignal.set(false);
        this.load();
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
