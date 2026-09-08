import { OrderStatus } from './order.model';

/** Resumen del panel — respuesta de `GET /api/admin/dashboard`. */
export interface Dashboard {
  pendingOrders: number;
  month: { revenue: number; units: number; orders: number };
  products: { active: number; hidden: number };
  recentOrders: DashboardOrder[];
  /** Umbral global de stock bajo por defecto (unidades por talle). */
  defaultLowStockThreshold: number;
  lowStock: LowStockItem[];
}

export interface DashboardOrder {
  id: string;
  code: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

/** Un talle de un producto que está en o por debajo de su umbral de stock. */
export interface LowStockItem {
  productId: string;
  productName: string;
  size: string;
  stock: number;
  threshold: number;
}
