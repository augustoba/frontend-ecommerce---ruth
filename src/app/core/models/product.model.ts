import { ProductParams } from './param.model';

/**
 * Un talle, como texto libre. Los valores posibles ya no están fijos en el
 * código: salen de la "escala de talle" elegida en el producto (ver
 * SizeScaleService y `sizeScaleId`). Se mantiene el alias por legibilidad.
 */
export type ProductSize = string;

/** Stock disponible para un talle puntual de un producto */
export interface SizeStock {
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  /**
   * Clasificación del producto según las parametrías (ver ParamService):
   * { [groupId]: optionId[] }. Reemplaza a la vieja `category` fija.
   */
  params: ProductParams;
  /** Edad orientativa, ej: "2 a 4 años" — se muestra en la ficha del producto */
  ageRange: string;
  /** Escala de talle elegida (id de SizeScale). De acá salen los talles válidos. */
  sizeScaleId?: string;
  /** Talles en los que viene el producto, cada uno con su propio stock */
  sizeStocks: SizeStock[];
  /** Fotos del producto, en orden. La primera es la portada. Siempre hay al menos una. */
  images: string[];
  /** Link a un video de la prenda (YouTube). Opcional. Se muestra embebido en la ficha. */
  videoUrl?: string;
  /** Portada (primera de `images`). La calcula el backend; sirve para tarjetas y carrito. */
  imageUrl: string;
  active: boolean;
  /**
   * true = el dueño/a decidió no reponer más este producto. Se sigue vendiendo
   * mientras tenga stock (no cambia `active`), pero deja de aparecer en las
   * alertas de "por reponer" del panel.
   */
  discontinued: boolean;
  /** true = producto archivado (soft-delete). No aparece en catálogo ni en los listados del panel. */
  deleted: boolean;
  createdAt: string;

  /**
   * Proveedor al que se le compró la prenda (id de Supplier). Info interna del
   * admin, opcional — NO se muestra en la tienda ni en el pedido.
   */
  supplierId?: string;
  /** Precio de compra al proveedor, en ARS. Info interna del admin, opcional. */
  costPrice?: number;
  /**
   * A partir de cuántas unidades por talle este producto se considera "stock
   * bajo" (para las alertas de reposición). Vacío = usar el default global (3).
   */
  lowStockThreshold?: number;
  /**
   * Código de barras real (EAN/UPC de fábrica) — opcional. Distinto del QR
   * propio de la tienda (`admin-product-qr`, apunta a la ficha del producto);
   * este es el que trae la etiqueta del fabricante, para cargarlo al vuelo
   * con un lector en Venta en el local.
   */
  barcode?: string;
  /**
   * Alícuota de IVA (21, 10.5, 5, 2.5 o 0) — vacío = 21% (default). Sólo
   * importa para Factura A/B de ARCA (la C no discrimina IVA).
   */
  ivaRate?: number;
}

/**
 * Datos con los que se crea/edita un producto desde el panel. `imageUrl` no se
 * manda: el backend lo deriva de `images[0]`.
 */
export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'imageUrl' | 'deleted'>;

/** Stock total del producto sumando todos los talles */
export function totalStock(product: Pick<Product, 'sizeStocks'>): number {
  return product.sizeStocks.reduce((sum, s) => sum + s.stock, 0);
}

/** Stock disponible para un talle específico (0 si el producto no viene en ese talle) */
export function stockForSize(product: Pick<Product, 'sizeStocks'>, size: ProductSize): number {
  return product.sizeStocks.find((s) => s.size === size)?.stock ?? 0;
}

/**
 * Ganancia del producto (precio de venta − precio de costo). Devuelve null si
 * no hay `costPrice` cargado. `percent` es el markup sobre el costo.
 */
export function margin(
  product: Pick<Product, 'price' | 'costPrice'>
): { amount: number; percent: number } | null {
  const cost = product.costPrice;
  if (!cost || cost <= 0) return null;
  const amount = product.price - cost;
  return { amount, percent: Math.round((amount / cost) * 100) };
}

/** true si el producto tiene elegida esa opción de parametría */
export function productHasParam(
  product: Pick<Product, 'params'>,
  groupId: string,
  optionId: string
): boolean {
  return (product.params?.[groupId] ?? []).includes(optionId);
}
