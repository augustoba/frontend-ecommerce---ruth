import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { apiUrl } from '../config/site-config';
import { LoadStatus } from '../state/collection-store';
import { SalesMetrics, YearComparison } from '../models/metrics.model';

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

  private readonly comparisonSignal = signal<YearComparison | null>(null);
  private readonly comparisonStatusSignal = signal<LoadStatus>('idle');

  readonly metrics = this.dataSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly comparison = this.comparisonSignal.asReadonly();
  readonly comparisonStatus = this.comparisonStatusSignal.asReadonly();

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

  /** Comparativas del año (venta total mes a mes + semana en curso vs. meses anteriores). */
  loadComparison(): void {
    if (this.comparisonStatusSignal() === 'loading') return;
    this.comparisonStatusSignal.set('loading');
    this.http.get<YearComparison>(apiUrl('/admin/metrics/comparison')).subscribe({
      next: (c) => {
        this.comparisonSignal.set(c);
        this.comparisonStatusSignal.set('loaded');
      },
      error: () => this.comparisonStatusSignal.set('error'),
    });
  }
}
