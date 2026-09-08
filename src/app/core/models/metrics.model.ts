/** Métricas de ventas del panel — respuesta de `GET /api/admin/metrics`. */
export interface SalesMetrics {
  /** Rango consultado (YYYY-MM-DD), inclusivo. */
  from: string;
  to: string;
  /** Campo de fecha usado para ubicar cada venta en el tiempo (`processedAt`). */
  basis: string;
  totals: MetricsTotals;
  byMonth: MonthBucket[];
  topProducts: ProductStat[];
  bottomProducts: ProductStat[];
  byGroup: GroupBreakdown;
}

export interface MetricsTotals {
  /** Precio de lista × cantidad de las líneas aceptadas (no aplica el descuento del pedido). */
  revenue: number;
  units: number;
  orders: number;
}

export interface MonthBucket {
  /** "YYYY-MM" */
  month: string;
  revenue: number;
  units: number;
  orders: number;
}

export interface ProductStat {
  productId: string;
  productName: string;
  units: number;
  revenue: number;
}

export interface GroupBreakdown {
  groupId: string;
  groupName: string;
  rows: GroupRow[];
}

export interface GroupRow {
  /** null = productos sin dato para ese grupo. */
  optionId: string | null;
  label: string;
  units: number;
  revenue: number;
}

/** Etiqueta legible de un mes "YYYY-MM" → "sep 2026". */
export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${meses[m - 1] ?? m} ${y}`;
}
