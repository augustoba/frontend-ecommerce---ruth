import { Product, ProductSize } from './product.model';

export interface CartItem {
  product: Product;
  size: ProductSize;
  quantity: number;
}
