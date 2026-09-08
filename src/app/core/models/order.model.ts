import { ProductSize } from './product.model';

/** Estados que devuelve el backend (en MAYÚSCULA). */
export type OrderStatus = 'PENDIENTE' | 'PROCESADO' | 'CANCELADO';

export interface OrderLine {
  /** id de la línea (lo asigna el backend) */
  id: string;
  productId: string;
  /** Nombre del producto al momento del pedido (por si luego se edita/borra el producto) */
  productName: string;
  size: ProductSize;
  quantity: number;
  /** Precio unitario al momento del pedido */
  unitPrice: number;
  /** El dueño/a lo tilda para confirmar que hay stock y lo va a entregar */
  accepted: boolean;
}

export interface Order {
  id: string;
  /** Código corto para identificar el pedido por WhatsApp, ej: "PED-0007" */
  code: string;
  customerName: string;
  lines: OrderLine[];
  /** Suma de todos los ítems, sin descuento */
  subtotal: number;
  /** % de descuento aplicado (0 si no llegó a ningún escalón de promoción) */
  discountPercent: number;
  /** Monto de descuento en pesos */
  discountAmount: number;
  /** Total final a cobrar (subtotal - descuento) */
  total: number;
  status: OrderStatus;
  createdAt: string;
  processedAt?: string;
}
