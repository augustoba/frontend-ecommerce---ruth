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
 * Categorías fijas del lado del frontend (no hay una parametría de "categoría
 * de gasto" en el backend — `categoryOptionId` es sólo un string libre).
 */
export const EXPENSE_CATEGORIES: { id: string; label: string }[] = [
  { id: 'alquiler', label: 'Alquiler' },
  { id: 'servicios', label: 'Servicios (luz/agua/internet)' },
  { id: 'sueldos', label: 'Sueldos' },
  { id: 'mercaderia', label: 'Mercadería / insumos' },
  { id: 'impuestos', label: 'Impuestos' },
  { id: 'marketing', label: 'Marketing / publicidad' },
  { id: 'envios', label: 'Envíos / logística' },
  { id: 'otros', label: 'Otros' },
];

export function expenseCategoryLabel(id: string | null | undefined): string {
  if (!id) return 'Sin categoría';
  return EXPENSE_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
