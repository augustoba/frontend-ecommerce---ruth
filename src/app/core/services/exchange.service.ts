import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../config/site-config';
import { CreateExchangeInput, Exchange } from '../models/exchange.model';

/** Cambios de prenda en el local (`/admin/cambios`). */
@Injectable({ providedIn: 'root' })
export class ExchangeService {
  private readonly http = inject(HttpClient);

  readonly exchanges = signal<Exchange[]>([]);
  readonly loading = signal(false);
  readonly error = signal(false);

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.http.get<Exchange[]>(apiUrl('/admin/exchanges')).subscribe({
      next: (list) => {
        this.exchanges.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  fetchOne(id: string): Observable<Exchange> {
    return this.http.get<Exchange>(apiUrl(`/admin/exchanges/${id}`));
  }

  create(body: CreateExchangeInput): Observable<Exchange> {
    return this.http.post<Exchange>(apiUrl('/admin/exchanges'), body);
  }
}
