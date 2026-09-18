export interface Expense {
  id: string;
  date: string;
  categoryOptionId?: string | null;
  amount: number;
  description?: string | null;
  repeatMonthly: boolean;
  recurringGroupId?: string | null;
}

export interface ExpenseInput {
  date: string;
  categoryOptionId?: string | null;
  amount: number;
  description?: string | null;
  repeatMonthly?: boolean;
}

export interface ExpenseBudget {
  id: string;
  categoryOptionId: string;
  monthlyAmount: number;
}

export interface BudgetStatus {
  budgetId: string;
  categoryOptionId: string;
  monthlyAmount: number;
  spent: number;
  exceeded: boolean;
}

/**
 * Id de la parametría "Categoría de gasto" (seedeada por
 * `DataSeeder.seedExpenseCategoryParamGroup`, ver backend). El dueño
 * agrega/edita/borra las opciones desde `/admin/parametrias` como con
 * cualquier otra parametría — `categoryOptionId` es la FK "blanda" a una
 * opción de este grupo.
 */
export const EXPENSE_CATEGORY_GROUP_ID = 'grp-categoria-gasto';
