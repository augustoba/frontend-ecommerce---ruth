import { PaymentMethod } from './order.model';

export type ExchangeLineKind = 'DEVUELTA' | 'LLEVADA';

export interface ExchangeLine {
  kind: ExchangeLineKind;
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface Exchange {
  id: string;
  code: string;
  customerName: string;
  returnedTotal: number;
  takenTotal: number;
  /** takenTotal − returnedTotal. Positivo = cobra el local; negativo = a favor del cliente. */
  difference: number;
  paymentMethod: PaymentMethod | null;
  note: string | null;
  createdAt: string;
  lines: ExchangeLine[];
}

export interface ExchangeItemInput {
  productId: string;
  size: string;
  quantity: number;
}

export interface CreateExchangeInput {
  customerName: string;
  returned: ExchangeItemInput[];
  taken: ExchangeItemInput[];
  paymentMethod: PaymentMethod | null;
  note: string | null;
}
