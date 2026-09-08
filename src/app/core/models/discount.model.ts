/**
 * Descuentos configurables desde /admin/promociones. Dos tipos:
 *  - 'monto': por monto de compra ("compra mayor a $X → Y% off"), a nivel carrito.
 *  - 'parametro': por parametría ("todo lo de bebé 15% off"), a nivel de cada
 *     ítem del carrito cuyo producto tenga esa opción.
 */
export type DiscountKind = 'monto' | 'parametro';

export interface Discount {
  id: string;
  kind: DiscountKind;
  /** Porcentaje de descuento (0-100) */
  discountPercent: number;
  enabled: boolean;
  /** Texto libre opcional para identificarlo en el panel */
  label?: string;

  /** kind === 'monto': monto mínimo de compra (subtotal) para que aplique */
  minAmount?: number;

  /** kind === 'parametro': grupo + opción de parametría a la que apunta */
  groupId?: string;
  optionId?: string;
}

/**
 * Cómo se combinan el descuento por parámetro y el descuento por monto:
 *  - 'mejor': se aplica el que más ahorra (no se acumulan).
 *  - 'combinar': primero el de parámetro por ítem, y el de monto sobre el
 *     subtotal ya rebajado.
 */
export type DiscountCombineMode = 'mejor' | 'combinar';

/** Detalle de cada descuento aplicado, para mostrarlo en el carrito */
export interface DiscountBreakdownLine {
  label: string;
  amount: number;
}

export interface CartDiscountResult {
  /** % efectivo sobre el subtotal (redondeado), para el pedido/WhatsApp */
  discountPercent: number;
  discountAmount: number;
  breakdown: DiscountBreakdownLine[];
}
