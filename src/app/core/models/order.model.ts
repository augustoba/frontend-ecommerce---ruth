import { ProductSize } from './product.model';

/** Estados que devuelve el backend (en MAYÚSCULA). */
export type OrderStatus = 'PENDIENTE' | 'PROCESADO' | 'CANCELADO';

/** Cómo recibe el pedido el cliente. */
export type DeliveryMethod = 'PICKUP' | 'SHIPPING';

/** Medio de pago que elige el cliente (para que el dueño sepa qué mandar). */
export type PaymentMethod = 'TRANSFER' | 'QR_TRANSFER' | 'QR_CARD' | 'CASH' | 'MERCADOPAGO' | 'POSNET';

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  TRANSFER: 'Transferencia (alias/CBU)',
  QR_TRANSFER: 'QR de transferencia',
  QR_CARD: 'Tarjeta (QR o link)',
  CASH: 'Efectivo al recibir/retirar',
  MERCADOPAGO: 'Mercado Pago',
  POSNET: 'Tarjeta (posnet del local)',
};

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

/** Vista pública de un pedido (consulta "mis pedidos" con código + nombre). */
export interface PublicOrder {
  code: string;
  customerName: string;
  status: OrderStatus;
  createdAt: string;
  processedAt?: string | null;
  deliveryMethod: DeliveryMethod;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  paymentMethod?: PaymentMethod | null;
  /** Sólo `paymentMethod === 'MERCADOPAGO'`. */
  paymentStatus?: PaymentStatus | null;
  /** Sólo si `paymentStatus === 'PENDING'` — para poder terminar de pagar. */
  mpCheckoutUrl?: string | null;
  items: { productName: string; size: string; quantity: number; unitPrice: number }[];
}

/** De dónde vino la venta. */
export type SaleChannel = 'WEB' | 'LOCAL';

export interface Order {
  id: string;
  /** Código corto para identificar el pedido por WhatsApp, ej: "PED-0007" */
  code: string;
  customerName: string;
  /** Opcional: para la base de clientes y campañas de marketing. */
  customerEmail?: string | null;
  /** WEB (checkout) o LOCAL (venta cargada en el panel). Pedidos viejos: WEB. */
  channel?: SaleChannel;
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
  /** Entrega. Los pedidos viejos vienen como 'PICKUP'. */
  deliveryMethod: DeliveryMethod;
  /** Dirección de envío normalizada (solo si deliveryMethod === 'SHIPPING'). */
  shippingAddress?: string | null;
  shippingReference?: string | null;
  shippingLat?: number | null;
  shippingLng?: number | null;
  paymentMethod?: PaymentMethod | null;
  /** Si al crear el pedido aplicaba "envío gratis": el texto para el cliente. */
  freeShippingNote?: string | null;
  /** Letra chica de los descuentos aplicados (ej: "solo microcentro"). */
  discountNote?: string | null;
  /** Código de cupón aplicado al pedido (null = ninguno). */
  couponCode?: string | null;
  /** Descuento en pesos del cupón (aparte del descuento automático). */
  couponDiscount?: number | null;
  /** Quién armó el pedido (null en el checkout web público). */
  createdByName?: string | null;
  /** Quién lo confirmó/cobró (null hasta que se confirma). */
  confirmedByName?: string | null;
  /** Sólo `paymentMethod === 'MERCADOPAGO'`. */
  paymentStatus?: PaymentStatus | null;
  /** Link al checkout de Mercado Pago — redirigir acá apenas se crea el pedido. */
  mpCheckoutUrl?: string | null;
  /** Mercado Pago aprobó el pago pero no se pudo confirmar el pedido solo — hace falta revisarlo a mano. null = sin problemas. */
  paymentIssueNote?: string | null;
  /** Venta presencial en efectivo: con cuánto pagó el cliente. Sólo tiene sentido con `paymentMethod === 'CASH'`. */
  amountTendered?: number | null;
  /** Nombre de quien transfirió, o número de ticket del posnet, según el medio — anotado a mano, sin integración real. */
  paymentReference?: string | null;
  /** "TICKET_INTERNO" | "FACTURA_A" | "FACTURA_B" | "FACTURA_C" — sólo se completa al confirmar una venta presencial (canal LOCAL). */
  invoiceType?: string | null;
  /** CUIT del comprador, si se cargó al cobrar (sólo tiene efecto en tiendas Responsable Inscripto — habilita Factura A). */
  invoiceBuyerCuit?: string | null;
  invoiceCae?: string | null;
  /** yyyyMMdd, tal cual lo devuelve ARCA. */
  invoiceCaeVencimiento?: string | null;
  invoiceNumber?: number | null;
  invoicePuntoVenta?: number | null;
  invoiceQrUrl?: string | null;
  /** ARCA rechazó la Factura C (o falló la conexión) — la venta quedó igual como ticket interno. null = sin problemas. */
  invoiceError?: string | null;
}

/** Sólo aplica a pedidos con `paymentMethod === 'MERCADOPAGO'`. */
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
