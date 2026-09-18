import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BalanceResponse, MonthBalance } from '../models/balance.model';
import { apiUrl } from '../config/site-config';

/** Balance (ventas - costo - gastos) — `/api/admin/balance`. */
@Injectable({ providedIn: 'root' })
export class BalanceService {
  private readonly http = inject(HttpClient);

  readonly period = signal<BalanceResponse | null>(null);
  readonly loading = signal(false);

  loadPeriod(from: string, to: string): void {
    this.loading.set(true);
    this.http
      .get<BalanceResponse>(apiUrl('/admin/balance'), { params: new HttpParams().set('from', from).set('to', to) })
      .subscribe({
        next: (r) => {
          this.period.set(r);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  /** Serie mensual de un año — para el gráfico y para año vs. año anterior. */
  loadComparison(year: number) {
    return this.http.get<MonthBalance[]>(apiUrl('/admin/balance/comparison'), {
      params: new HttpParams().set('year', year),
    });
  }
}
