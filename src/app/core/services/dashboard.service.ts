import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../config/site-config';
import { LoadStatus } from '../state/collection-store';
import { Dashboard, ExpiringCaeItem, LowStockItem } from '../models/dashboard.model';

/** Clave de un talle en alerta de stock (para marcarlo como "visto"). */
export const lowStockKey = (item: Pick<LowStockItem, 'productId' | 'size'>): string =>
  `${item.productId}::${item.size}`;

const SEEN_STORAGE_KEY = 'ep_low_stock_seen';

/**
 * Resumen del panel (`GET /api/admin/dashboard`) + la lista de "productos por
 * reponer" (`GET /api/admin/low-stock`, más liviana, para el badge del menú).
 *
 * El badge del menú funciona como "notificaciones no leídas": cada talle en
 * alerta que el admin abre desde la lista queda marcado como visto (en
 * `localStorage`) y deja de sumar al contador, aunque todavía no se haya
 * repuesto. Si un talle se repone y más adelante vuelve a bajar, la clave se
 * limpia sola al recargar y vuelve a alertar.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  private readonly dataSignal = signal<Dashboard | null>(null);
  private readonly statusSignal = signal<LoadStatus>('idle');
  private readonly lowStockSignal = signal<LowStockItem[]>([]);
  private readonly seenSignal = signal<Set<string>>(this.readSeen());
  private lowStockLoaded = false;

  readonly dashboard = this.dataSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly lowStock = this.lowStockSignal.asReadonly();
  readonly seenLowStock = this.seenSignal.asReadonly();
  /** Talles en alerta que el admin todavía no revisó — lo que muestra el badge. */
  readonly lowStockCount = computed(
    () => this.lowStockSignal().filter((i) => !this.seenSignal().has(lowStockKey(i))).length,
  );
  /** Total de talles en la lista de reposición (revisados + sin revisar). */
  readonly lowStockTotal = computed(() => this.lowStockSignal().length);

  // --- CAE por vencer (ítem 5) ---
  private readonly expiringCaeSignal = signal<ExpiringCaeItem[]>([]);
  private expiringCaeLoaded = false;
  readonly expiringCae = this.expiringCaeSignal.asReadonly();
  readonly expiringCaeCount = computed(() => this.expiringCaeSignal().length);

  ensureExpiringCaeLoaded(): void {
    if (this.expiringCaeLoaded) return;
    this.expiringCaeLoaded = true;
    this.http.get<ExpiringCaeItem[]>(apiUrl('/admin/expiring-cae')).subscribe({
      next: (items) => this.expiringCaeSignal.set(items),
      error: () => {
        this.expiringCaeLoaded = false;
      },
    });
  }

  reload = (): void => this.loadDashboard();

  isLowStockSeen(item: Pick<LowStockItem, 'productId' | 'size'>): boolean {
    return this.seenSignal().has(lowStockKey(item));
  }

  /**
   * Saca todos los talles de un producto de la lista de reposición (cuando se
   * lo marcó "no reponer"). Es sólo optimista para el front: el backend ya no
   * lo va a devolver en la próxima carga.
   */
  removeProductFromLowStock(productId: string): void {
    this.lowStockSignal.update((items) => items.filter((i) => i.productId !== productId));
    const d = this.dataSignal();
    if (d) {
      this.dataSignal.set({ ...d, lowStock: d.lowStock.filter((i) => i.productId !== productId) });
    }
  }

  /** Marca un talle en alerta como revisado (baja el contador del menú). */
  markLowStockSeen(item: Pick<LowStockItem, 'productId' | 'size'>): void {
    const key = lowStockKey(item);
    if (this.seenSignal().has(key)) return;
    const next = new Set(this.seenSignal());
    next.add(key);
    this.seenSignal.set(next);
    this.persistSeen(next);
  }

  /** Carga el resumen completo (pantalla de inicio del panel). */
  loadDashboard(): void {
    this.statusSignal.set('loading');
    this.http.get<Dashboard>(apiUrl('/admin/dashboard')).subscribe({
      next: (d) => {
        this.dataSignal.set(d);
        this.applyLowStock(d.lowStock);
        this.lowStockLoaded = true;
        this.statusSignal.set('loaded');
      },
      error: () => this.statusSignal.set('error'),
    });
  }

  /** Sólo la lista de stock bajo — para el badge del menú, en cualquier pantalla del panel. */
  ensureLowStockLoaded(): void {
    if (this.lowStockLoaded) return;
    this.lowStockLoaded = true;
    this.http.get<LowStockItem[]>(apiUrl('/admin/low-stock')).subscribe({
      next: (items) => this.applyLowStock(items),
      error: () => {
        this.lowStockLoaded = false;
      },
    });
  }

  /** Guarda la lista fresca y descarta las marcas de "visto" de talles que ya no están en alerta. */
  private applyLowStock(items: LowStockItem[]): void {
    this.lowStockSignal.set(items);
    const live = new Set(items.map(lowStockKey));
    const pruned = new Set([...this.seenSignal()].filter((k) => live.has(k)));
    if (pruned.size !== this.seenSignal().size) {
      this.seenSignal.set(pruned);
      this.persistSeen(pruned);
    }
  }

  private readSeen(): Set<string> {
    try {
      const raw = localStorage.getItem(SEEN_STORAGE_KEY);
      const arr = raw ? (JSON.parse(raw) as unknown) : [];
      return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : []);
    } catch {
      return new Set();
    }
  }

  private persistSeen(seen: Set<string>): void {
    try {
      localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify([...seen]));
    } catch {
      /* localStorage lleno o no disponible: el badge sigue andando en memoria */
    }
  }
}
