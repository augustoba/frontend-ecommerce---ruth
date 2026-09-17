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
