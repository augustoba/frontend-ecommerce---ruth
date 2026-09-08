import { ProductParams } from './param.model';

export type ProductSize = 'RN' | '0-3M' | '3-6M' | '6-12M' | '1' | '2' | '3' | '4' | '6' | '8' | '10' | '12' | '14' | '16';

/** Stock disponible para un talle puntual de un producto */
export interface SizeStock {
  size: ProductSize;
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
  /** Talles en los que viene el producto, cada uno con su propio stock */
  sizeStocks: SizeStock[];
  imageUrl: string;
  active: boolean;
  createdAt: string;
}

/** Datos con los que se crea/edita un producto desde el panel de administración */
export type ProductInput = Omit<Product, 'id' | 'createdAt'>;

/** Stock total del producto sumando todos los talles */
export function totalStock(product: Pick<Product, 'sizeStocks'>): number {
  return product.sizeStocks.reduce((sum, s) => sum + s.stock, 0);
}

/** Stock disponible para un talle específico (0 si el producto no viene en ese talle) */
export function stockForSize(product: Pick<Product, 'sizeStocks'>, size: ProductSize): number {
  return product.sizeStocks.find((s) => s.size === size)?.stock ?? 0;
}

/** true si el producto tiene elegida esa opción de parametría */
export function productHasParam(
  product: Pick<Product, 'params'>,
  groupId: string,
  optionId: string
): boolean {
  return (product.params?.[groupId] ?? []).includes(optionId);
}
