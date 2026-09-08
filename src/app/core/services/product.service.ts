import { Injectable, computed, signal } from '@angular/core';
import { Product, ProductInput, SizeStock, stockForSize } from '../models/product.model';
import { clothingIconDataUri } from '../assets/clothing-icons';

const STORAGE_KEY = 'pp_products';

/**
 * Catálogo de ejemplo. Cuando exista el backend en Java, este service se
 * puede reemplazar por uno que haga HttpClient a la API sin tocar el resto
 * de la app (los componentes solo dependen de los signals que expone acá).
 */
const MOCK_PRODUCTS: Product[] = [
  {
    id: crypto.randomUUID(),
    name: 'Body manga larga estampado animales',
    description: 'Body de algodón suave, manga larga, con estampa de animalitos. Ideal para el día a día.',
    price: 9800,
    category: 'bebe',
    ageRange: '0 a 12 meses',
    sizeStocks: [
      { size: 'RN', stock: 4 },
      { size: '0-3M', stock: 3 },
      { size: '3-6M', stock: 4 },
      { size: '6-12M', stock: 3 },
    ],
    imageUrl: clothingIconDataUri('onesie', { bg: '#fff7ed', fill: '#fdba74' }),
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Conjunto jogging campera + pantalón',
    description: 'Conjunto de frisa perchada, campera con capucha y pantalón con puños. Súper abrigado.',
    price: 24500,
    category: 'nene',
    ageRange: '2 a 8 años',
    sizeStocks: [
      { size: '2', stock: 2 },
      { size: '3', stock: 2 },
      { size: '4', stock: 3 },
      { size: '6', stock: 1 },
      { size: '8', stock: 1 },
    ],
    imageUrl: clothingIconDataUri('hoodie', { bg: '#eef9ff', fill: '#85d6ff' }),
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Vestido plumeti volados',
    description: 'Vestido liviano de tela plumeti con volados en el ruedo y moño en la espalda.',
    price: 19900,
    category: 'nena',
    ageRange: '2 a 10 años',
    sizeStocks: [
      { size: '2', stock: 2 },
      { size: '3', stock: 2 },
      { size: '4', stock: 3 },
      { size: '6', stock: 2 },
      { size: '8', stock: 1 },
      { size: '10', stock: 1 },
    ],
    imageUrl: clothingIconDataUri('dress', { bg: '#fdf2f8', fill: '#f9a8d4' }),
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Remera básica algodón (pack x3)',
    description: 'Pack de 3 remeras lisas de algodón peinado en colores surtidos. Unisex.',
    price: 15600,
    category: 'unisex',
    ageRange: '1 a 12 años',
    sizeStocks: [
      { size: '1', stock: 3 },
      { size: '2', stock: 3 },
      { size: '3', stock: 3 },
      { size: '4', stock: 4 },
      { size: '6', stock: 2 },
      { size: '8', stock: 2 },
      { size: '10', stock: 2 },
      { size: '12', stock: 1 },
    ],
    imageUrl: clothingIconDataUri('tshirt', { bg: '#f0fdf4', fill: '#86e6bb' }),
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Jean chupín con elástico',
    description: 'Jean chupín de tiro medio con cintura elastizada para mayor comodidad.',
    price: 21300,
    category: 'nena',
    ageRange: '2 a 12 años',
    sizeStocks: [
      { size: '2', stock: 1 },
      { size: '3', stock: 1 },
      { size: '4', stock: 2 },
      { size: '6', stock: 1 },
      { size: '8', stock: 1 },
      { size: '10', stock: 1 },
      { size: '12', stock: 0 },
    ],
    imageUrl: clothingIconDataUri('pants', { bg: '#eff6ff', fill: '#60a5fa' }),
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Buzo canguro dinosaurios',
    description: 'Buzo canguro de frisa con bolsillo y estampa de dinosaurios.',
    price: 18200,
    category: 'nene',
    ageRange: '2 a 10 años',
    sizeStocks: [
      { size: '2', stock: 0 },
      { size: '3', stock: 0 },
      { size: '4', stock: 0 },
      { size: '6', stock: 0 },
      { size: '8', stock: 0 },
      { size: '10', stock: 0 },
    ],
    imageUrl: clothingIconDataUri('hoodie', { bg: '#fefce8', fill: '#fde68a' }),
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Enterito corto verano',
    description: 'Enterito liviano de algodón, ideal para el verano, con broches en la entrepierna.',
    price: 13400,
    category: 'bebe',
    ageRange: '3 a 24 meses',
    sizeStocks: [
      { size: '3-6M', stock: 5 },
      { size: '6-12M', stock: 6 },
      { size: '1', stock: 3 },
      { size: '2', stock: 2 },
    ],
    imageUrl: clothingIconDataUri('onesie', { bg: '#fef2f2', fill: '#fca5a5' }),
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Campera inflable con capucha',
    description: 'Campera inflable liviana, abrigada, con capucha desmontable. Repelente al agua.',
    price: 32900,
    category: 'unisex',
    ageRange: '4 a 14 años',
    sizeStocks: [
      { size: '4', stock: 1 },
      { size: '6', stock: 1 },
      { size: '8', stock: 1 },
      { size: '10', stock: 1 },
      { size: '12', stock: 1 },
      { size: '14', stock: 0 },
    ],
    imageUrl: clothingIconDataUri('hoodie', { bg: '#eef2ff', fill: '#a5b4fc' }),
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Pollera short con volado',
    description: 'Pollera short de gabardina liviana con volado, cintura con elástico.',
    price: 12800,
    category: 'nena',
    ageRange: '2 a 10 años',
    sizeStocks: [
      { size: '2', stock: 2 },
      { size: '3', stock: 2 },
      { size: '4', stock: 2 },
      { size: '6', stock: 2 },
      { size: '8', stock: 1 },
      { size: '10', stock: 1 },
    ],
    imageUrl: clothingIconDataUri('skirt', { bg: '#fdf4ff', fill: '#f0abfc' }),
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Zapatillas urbanas velcro',
    description: 'Zapatillas livianas con cierre de velcro, suela antideslizante.',
    price: 27500,
    category: 'unisex',
    ageRange: '1 a 8 años',
    sizeStocks: [
      { size: '1', stock: 1 },
      { size: '2', stock: 2 },
      { size: '3', stock: 2 },
      { size: '4', stock: 1 },
      { size: '6', stock: 1 },
      { size: '8', stock: 1 },
    ],
    imageUrl: clothingIconDataUri('shoes', { bg: '#faf5ff', fill: '#d8b4fe' }),
    active: true,
    createdAt: new Date().toISOString(),
  },
];

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly productsSignal = signal<Product[]>(this.loadInitial());

  /** Todos los productos, incluidos los inactivos (para el panel de admin) */
  readonly products = this.productsSignal.asReadonly();

  /** Solo productos activos, para mostrar en el catálogo público (con o sin stock) */
  readonly availableProducts = computed(() =>
    this.productsSignal().filter((p) => p.active)
  );

  readonly categories: { value: Product['category']; label: string }[] = [
    { value: 'bebe', label: 'Bebé' },
    { value: 'nena', label: 'Nena' },
    { value: 'nene', label: 'Nene' },
    { value: 'unisex', label: 'Unisex' },
  ];

  getById(id: string): Product | undefined {
    return this.productsSignal().find((p) => p.id === id);
  }

  create(input: ProductInput): Product {
    const product: Product = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.productsSignal.update((list) => [product, ...list]);
    this.persist();
    return product;
  }

  update(id: string, input: ProductInput): void {
    this.productsSignal.update((list) =>
      list.map((p) => (p.id === id ? { ...p, ...input, id: p.id, createdAt: p.createdAt } : p))
    );
    this.persist();
  }

  delete(id: string): void {
    this.productsSignal.update((list) => list.filter((p) => p.id !== id));
    this.persist();
  }

  toggleActive(id: string): void {
    this.productsSignal.update((list) =>
      list.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
    this.persist();
  }

  /** Actualiza el stock de un talle puntual (ej: después de vender por WhatsApp) */
  setSizeStock(id: string, size: SizeStock['size'], stock: number): void {
    this.productsSignal.update((list) =>
      list.map((p) =>
        p.id === id
          ? {
              ...p,
              sizeStocks: p.sizeStocks.map((s) =>
                s.size === size ? { ...s, stock: Math.max(0, stock) } : s
              ),
            }
          : p
      )
    );
    this.persist();
  }

  /** Descuenta unidades del stock de un talle puntual (ej: al confirmar un pedido) */
  decrementStock(id: string, size: SizeStock['size'], quantity: number): void {
    const product = this.getById(id);
    if (!product) return;
    const current = stockForSize(product, size);
    this.setSizeStock(id, size, current - quantity);
  }

  /** Restaura el catálogo de ejemplo (útil para el botón "reiniciar datos" del admin) */
  resetToMock(): void {
    this.productsSignal.set(MOCK_PRODUCTS);
    this.persist();
  }

  private loadInitial(): Product[] {
    if (typeof localStorage === 'undefined') {
      return MOCK_PRODUCTS;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return MOCK_PRODUCTS;
      const parsed = JSON.parse(raw) as Product[];
      return Array.isArray(parsed) && parsed.length ? parsed : MOCK_PRODUCTS;
    } catch {
      return MOCK_PRODUCTS;
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.productsSignal()));
  }
}
