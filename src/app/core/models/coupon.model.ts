/** Tipo de descuento del cupón: porcentaje o monto fijo en ARS. */
export type CouponKind = 'PERCENT' | 'AMOUNT';

/** Estado que calcula el backend. */
export type CouponStatus = 'ACTIVO' | 'VENCIDO' | 'AGOTADO' | 'DESHABILITADO';

export interface Coupon {
  id: string;
  code: string;
  kind: CouponKind;
  /** % (0-100) si kind === 'PERCENT'; monto ARS si kind === 'AMOUNT'. */
  value: number;
  /** Subtotal mínimo para usarlo. null = sin mínimo. */
  minAmount?: number | null;
  /** Tope de usos. null = ilimitado. */
  maxUses?: number | null;
  usedCount: number;
  /** Último día de uso (YYYY-MM-DD, inclusive). null = sin vencimiento. */
  expiresAt?: string | null;
  enabled: boolean;
  /** true = combina con los descuentos automáticos. */
  stackable: boolean;
  label?: string | null;
  createdAt: string;
  status: CouponStatus;
}

/** Alta de cupón (1 o varios con `count`). */
export interface CouponInput {
  code?: string;
  count?: number;
  codePrefix?: string;
  kind: CouponKind;
  value: number;
  minAmount?: number | null;
  maxUses?: number | null;
  expiresAt?: string | null;
  enabled?: boolean;
  stackable?: boolean;
  label?: string | null;
}

/** Resultado de validar un código en el carrito (no lo consume). */
export interface CouponCheck {
  code: string;
  kind: CouponKind;
  value: number;
  discountAmount: number;
  stackable: boolean;
  label?: string | null;
}
