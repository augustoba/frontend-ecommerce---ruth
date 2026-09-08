import { PaymentMethod } from './order.model';

/**
 * Descuentos configurables desde /admin/promociones:
 *  - 'MONTO': por monto de compra ("compra mayor a $X → Y% off"), a nivel carrito.
 *  - 'PARAMETRO': por parametría ("todo lo de bebé 15% off"), por ítem del carrito.
 *  - 'PAGO': por medio de pago elegido en el carrito (efectivo, transferencia…).
 *  - 'ENVIO_GRATIS': informativo — si el subtotal supera `minAmount`, muestra
 *     "envío gratis" (+ el texto de `detail`). No descuenta plata.
 * (En MAYÚSCULA porque así los devuelve/espera el backend.)
 */
export type DiscountKind = 'MONTO' | 'PARAMETRO' | 'PAGO' | 'ENVIO_GRATIS';

/** Estado de vigencia que calcula el backend (con la fecha del servidor). */
export type DiscountStatus = 'ACTIVO' | 'PROGRAMADO' | 'VENCIDO' | 'DESHABILITADO';

export interface Discount {
  id: string;
  kind: DiscountKind;
  /** Porcentaje de descuento (0-100). 0 para ENVIO_GRATIS. */
  discountPercent: number;
  enabled: boolean;
  /** true si se puede combinar (sumar) con otros descuentos. */
  stackable: boolean;
  /** Nombre corto para el panel y el resumen del carrito. */
  label?: string | null;
  /** Letra chica configurable (ej: "solo microcentro"). Se muestra al cliente. */
  detail?: string | null;

  /** Vigencia opcional (YYYY-MM-DD, inclusive). Vacío = sin límite. */
  startsAt?: string | null;
  endsAt?: string | null;
  /** Lo calcula el backend; el front lo usa para el cálculo del carrito y el indicador. */
  status?: DiscountStatus;

  /** kind === 'MONTO' o 'ENVIO_GRATIS': monto mínimo de subtotal para que aplique */
  minAmount?: number;

  /** kind === 'PARAMETRO': grupo + opción de parametría a la que apunta */
  groupId?: string;
  optionId?: string;

  /** kind === 'PAGO': medios de pago a los que aplica */
  paymentMethods?: PaymentMethod[];
}

/** Detalle de cada descuento aplicado, para mostrarlo en el carrito */
export interface DiscountBreakdownLine {
  label: string;
  amount: number;
  detail?: string | null;
}

export interface CartDiscountResult {
  /** % efectivo sobre el subtotal (redondeado), para el pedido/WhatsApp */
  discountPercent: number;
  discountAmount: number;
  breakdown: DiscountBreakdownLine[];
  /** "Envío gratis" (informativo, no descuenta plata). null = no aplica. */
  freeShipping: { label: string; detail: string | null } | null;
}
