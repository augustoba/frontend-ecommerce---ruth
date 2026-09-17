export interface CreditNote {
  id: string;
  orderId: string;
  amount: number;
  reason?: string | null;
  type: string;
  cae?: string | null;
  caeVencimiento?: string | null;
  number?: number | null;
  puntoVenta?: number | null;
  qrUrl?: string | null;
  error?: string | null;
  createdByName?: string | null;
  createdAt: string;
}
