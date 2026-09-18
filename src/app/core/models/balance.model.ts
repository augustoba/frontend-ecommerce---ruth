export interface BalanceResponse {
  from: string;
  to: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  expenses: number;
  netResult: number;
  costDataComplete: boolean;
}

export interface MonthBalance {
  month: string;
  revenue: number;
  cost: number;
  expenses: number;
  netResult: number;
}
