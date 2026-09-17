import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BudgetStatus, ExpenseBudget } from '../models/expense.model';
import { apiUrl } from '../config/site-config';

/** Presupuesto mensual por categoría de gasto (ítem 21) — `/api/admin/expense-budgets`. */
@Injectable({ providedIn: 'root' })
export class ExpenseBudgetService {
  private readonly http = inject(HttpClient);

  private readonly budgetsSignal = signal<ExpenseBudget[]>([]);
  private readonly statusListSignal = signal<BudgetStatus[]>([]);
  readonly budgets = this.budgetsSignal.asReadonly();
  readonly statusList = this.statusListSignal.asReadonly();
  readonly saving = signal(false);

  private loaded = false;

  ensureLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;
    this.reload();
  }

  reload(): void {
    this.http.get<ExpenseBudget[]>(apiUrl('/admin/expense-budgets')).subscribe({
      next: (list) => this.budgetsSignal.set(list),
      error: () => {},
    });
    this.http.get<BudgetStatus[]>(apiUrl('/admin/expense-budgets/status')).subscribe({
      next: (list) => this.statusListSignal.set(list),
      error: () => {},
    });
  }

  upsert(categoryOptionId: string, monthlyAmount: number, onSuccess?: () => void): void {
    this.saving.set(true);
    this.http.post(apiUrl('/admin/expense-budgets'), { categoryOptionId, monthlyAmount }).subscribe({
      next: () => {
        this.saving.set(false);
        this.reload();
        onSuccess?.();
      },
      error: () => this.saving.set(false),
    });
  }

  remove(id: string): void {
    this.http.delete(apiUrl(`/admin/expense-budgets/${id}`)).subscribe({
      next: () => this.reload(),
      error: () => {},
    });
  }
}
