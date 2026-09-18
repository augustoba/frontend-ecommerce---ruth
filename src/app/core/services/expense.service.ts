import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Expense, ExpenseInput } from '../models/expense.model';
import { CollectionStore } from '../state/collection-store';
import { apiUrl } from '../config/site-config';

/** Gastos del emprendimiento — `/api/admin/expenses`. */
@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly http = inject(HttpClient);
  private readonly store = new CollectionStore<Expense>(this.http, '/admin/expenses');

  readonly expenses = this.store.items;
  readonly status = this.store.status;
  readonly saving = this.store.saving;
  readonly reload = this.store.reload;

  ensureLoaded(): void {
    this.store.ensureLoaded();
  }

  /** Carga con filtro de fecha (reemplaza el listado actual). */
  loadRange(from?: string, to?: string): void {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    this.http.get<Expense[]>(apiUrl('/admin/expenses'), { params }).subscribe({
      next: (list) => this.store.setItems(list),
      error: () => {},
    });
  }

  add(input: ExpenseInput): void {
    this.store.mutate(this.http.post(apiUrl('/admin/expenses'), input));
  }

  update(id: string, input: ExpenseInput): void {
    this.store.mutate(this.http.put(apiUrl(`/admin/expenses/${id}`), input));
  }

  remove(id: string): void {
    this.store.mutate(this.http.delete(apiUrl(`/admin/expenses/${id}`)));
  }
}
