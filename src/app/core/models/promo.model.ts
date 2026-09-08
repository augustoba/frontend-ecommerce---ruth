/** Descuento por monto de compra, ej: "compras mayores a $100.000 → 20% off" */
export interface PromoTier {
  id: string;
  /** Monto mínimo de compra (subtotal del carrito) para que aplique */
  minAmount: number;
  /** Porcentaje de descuento (0-100) */
  discountPercent: number;
  enabled: boolean;
}
