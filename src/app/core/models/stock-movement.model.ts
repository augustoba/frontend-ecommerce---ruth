export type StockMovementReason =
  | 'VENTA'
  | 'CAMBIO_DEVUELTA'
  | 'CAMBIO_LLEVADA'
  | 'AJUSTE_MANUAL'
  | 'ENTRADA_COMPRA'
  | 'ALTA_INICIAL';

export const STOCK_MOVEMENT_REASON_LABELS: Record<StockMovementReason, string> = {
  VENTA: 'Venta',
  CAMBIO_DEVUELTA: 'Cambio (devuelto)',
  CAMBIO_LLEVADA: 'Cambio (se llevó)',
  AJUSTE_MANUAL: 'Ajuste manual',
  ENTRADA_COMPRA: 'Compra a proveedor',
  ALTA_INICIAL: 'Alta de producto',
};

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  size: string;
  quantityDelta: number;
  reason: StockMovementReason;
  note?: string | null;
  referenceId?: string | null;
  unitCost?: number | null;
  createdByName?: string | null;
  createdAt: string;
}

export interface PurchaseInput {
  size: string;
  quantity: number;
  unitCost: number;
  supplierId?: string | null;
}
