import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ExpenseService } from '../../../core/services/expense.service';
import { ExpenseBudgetService } from '../../../core/services/expense-budget.service';
import { ParamService } from '../../../core/services/param.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { Expense, ExpenseInput } from '../../../core/models/expense.model';
import { downloadCsv } from '../../../core/utils/csv';

const CATEGORY_GROUP_ID = 'grp-categoria-gasto';

interface Draft {
  date: string;
  categoryOptionId: string;
  amount: number | null;
  description: string;
  repeatMonthly: boolean;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY: Draft = { date: today(), categoryOptionId: '', amount: null, description: '', repeatMonthly: false };

@Component({
  selector: 'app-admin-expenses',
  imports: [FormsModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './admin-expenses.component.html',
  styleUrl: './admin-expenses.component.css',
})
export class AdminExpensesComponent {
  private readonly expenseService = inject(ExpenseService);
  private readonly budgetService = inject(ExpenseBudgetService);
  private readonly paramService = inject(ParamService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly expenses = this.expenseService.expenses;
  readonly status = this.expenseService.status;
  readonly saving = this.expenseService.saving;

  readonly budgetStatus = this.budgetService.statusList;
  readonly budgetSaving = this.budgetService.saving;

  readonly categories = computed(
    () => this.paramService.groups().find((g) => g.id === CATEGORY_GROUP_ID)?.options ?? []
  );

  constructor() {
    this.expenseService.ensureLoaded();
    this.paramService.ensureLoaded();
    this.budgetService.ensureLoaded();
  }

  categoryLabel(id: string | null | undefined): string {
    if (!id) return 'Sin categoría';
    return this.paramService.labelFor(CATEGORY_GROUP_ID, id) || id;
  }

  // --- filtro de fecha ---
  readonly from = signal('');
  readonly to = signal('');

  applyDateFilter(): void {
    this.expenseService.loadRange(this.from() || undefined, this.to() || undefined);
  }

  clearDateFilter(): void {
    this.from.set('');
    this.to.set('');
    this.expenseService.ensureLoaded();
    this.expenseService.reload();
  }

  readonly total = computed(() => this.expenses().reduce((sum, e) => sum + e.amount, 0));

  // --- form alta/edición ---
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<Draft>({ ...EMPTY });
  readonly error = signal<string | null>(null);
  readonly isEditing = computed(() => this.editingId() !== null);

  startNew(): void {
    this.editingId.set(null);
    this.draft.set({ ...EMPTY });
    this.error.set(null);
  }

  startEdit(e: Expense): void {
    this.editingId.set(e.id);
    this.draft.set({
      date: e.date,
      categoryOptionId: e.categoryOptionId ?? '',
      amount: e.amount,
      description: e.description ?? '',
      repeatMonthly: e.repeatMonthly,
    });
    this.error.set(null);
  }

  patch<K extends keyof Draft>(key: K, value: Draft[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    this.error.set(null);
    const d = this.draft();
    if (!d.date || !d.amount || d.amount <= 0) {
      this.error.set('Cargá una fecha y un monto mayor a 0.');
      return;
    }
    const input: ExpenseInput = {
      date: d.date,
      categoryOptionId: d.categoryOptionId || null,
      amount: d.amount,
      description: d.description || null,
      repeatMonthly: d.repeatMonthly,
    };
    const id = this.editingId();
    if (id) this.expenseService.update(id, input);
    else this.expenseService.add(input);
    this.startNew();
  }

  async remove(e: Expense): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Eliminar gasto',
      message: `¿Eliminar el gasto "${e.description || this.categoryLabel(e.categoryOptionId)}" de ${e.amount}?`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (ok) {
      this.expenseService.remove(e.id);
      if (this.editingId() === e.id) this.startNew();
    }
  }

  exportCsv(): void {
    const rows: unknown[][] = [['Fecha', 'Categoría', 'Monto', 'Descripción', 'Repite cada mes']];
    for (const e of this.expenses()) {
      rows.push([e.date, this.categoryLabel(e.categoryOptionId), e.amount, e.description ?? '', e.repeatMonthly ? 'Sí' : 'No']);
    }
    downloadCsv(`gastos-${today()}.csv`, rows);
  }

  // --- presupuesto por categoría ---
  readonly budgetCategoryId = signal('');
  readonly budgetAmount = signal<number | null>(null);

  saveBudget(): void {
    const cat = this.budgetCategoryId();
    const amount = this.budgetAmount();
    if (!cat || !amount || amount <= 0) {
      this.toast.error('Elegí una categoría y un monto válido.');
      return;
    }
    this.budgetService.upsert(cat, amount, () => {
      this.toast.success('Presupuesto guardado.');
      this.budgetCategoryId.set('');
      this.budgetAmount.set(null);
    });
  }

  removeBudget(id: string): void {
    this.budgetService.remove(id);
  }
}
