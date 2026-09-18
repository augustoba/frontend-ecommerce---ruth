import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { StockMovement } from '../models/stock-movement.model';
import { apiUrl } from '../config/site-config';
import { LoadStatus } from '../state/collection-store';

/** Historial de movimientos de stock — `GET /api/admin/stock-movements`. */
@Injectable({ providedIn: 'root' })
export class StockMovementService {
  private readonly http = inject(HttpClient);

  private readonly itemsSignal = signal<StockMovement[]>([]);
  private readonly statusSignal = signal<LoadStatus>('idle');

  readonly items = this.itemsSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();

  load(filters: { productId?: string; from?: string; to?: string } = {}): void {
    this.statusSignal.set('loading');
    let params = new HttpParams();
    if (filters.productId) params = params.set('productId', filters.productId);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    this.http.get<StockMovement[]>(apiUrl('/admin/stock-movements'), { params }).subscribe({
      next: (list) => {
        this.itemsSignal.set(list);
        this.statusSignal.set('loaded');
      },
      error: () => this.statusSignal.set('error'),
    });
  }
}
