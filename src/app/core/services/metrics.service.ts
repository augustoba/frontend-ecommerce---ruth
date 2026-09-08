import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { apiUrl } from '../config/site-config';
import { LoadStatus } from '../state/collection-store';
import { SalesMetrics } from '../models/metrics.model';

export interface MetricsQuery {
  /** YYYY-MM-DD */
  from: string;
  to: string;
  /** id del grupo de parametría para el desglose (por defecto el backend usa "grp-tipo"). */
  groupBy: string;
}

/**
 * Métricas de ventas (`GET /api/admin/metrics`). Se piden con un rango de fechas
 * + el grupo de parametría del desglose; cada `load()` reemplaza el resultado.
 */
@Injectable({ providedIn: 'root' })
export class MetricsService {
  private readonly http = inject(HttpClient);

  private readonly dataSignal = signal<SalesMetrics | null>(null);
  private readonly statusSignal = signal<LoadStatus>('idle');
  private lastQuery: MetricsQuery | null = null;

  readonly metrics = this.dataSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();

  load(query: MetricsQuery): void {
    this.lastQuery = query;
    this.statusSignal.set('loading');

    let params = new HttpParams().set('from', query.from).set('to', query.to);
    if (query.groupBy) params = params.set('groupBy', query.groupBy);

    this.http.get<SalesMetrics>(apiUrl('/admin/metrics'), { params }).subscribe({
      next: (m) => {
        this.dataSignal.set(m);
        this.statusSignal.set('loaded');
      },
      error: () => this.statusSignal.set('error'),
    });
  }

  reload(): void {
    if (this.lastQuery) this.load(this.lastQuery);
  }
}
