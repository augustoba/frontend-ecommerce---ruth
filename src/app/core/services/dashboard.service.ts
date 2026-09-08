import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../config/site-config';
import { LoadStatus } from '../state/collection-store';
import { Dashboard, LowStockItem } from '../models/dashboard.model';

/**
 * Resumen del panel (`GET /api/admin/dashboard`) + la lista de "productos por
 * reponer" (`GET /api/admin/low-stock`, más liviana, para el badge del menú).
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  private readonly dataSignal = signal<Dashboard | null>(null);
  private readonly statusSignal = signal<LoadStatus>('idle');
  private readonly lowStockSignal = signal<LowStockItem[]>([]);
  private lowStockLoaded = false;

  readonly dashboard = this.dataSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly lowStock = this.lowStockSignal.asReadonly();
  readonly lowStockCount = computed(() => this.lowStockSignal().length);

  reload = (): void => this.loadDashboard();

  /** Carga el resumen completo (pantalla de inicio del panel). */
  loadDashboard(): void {
    this.statusSignal.set('loading');
    this.http.get<Dashboard>(apiUrl('/admin/dashboard')).subscribe({
      next: (d) => {
        this.dataSignal.set(d);
        this.lowStockSignal.set(d.lowStock);
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
      next: (items) => this.lowStockSignal.set(items),
      error: () => {
        this.lowStockLoaded = false;
      },
    });
  }
}
