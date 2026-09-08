import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/catalog/catalog-page/catalog-page.component').then(
        (m) => m.CatalogPageComponent
      ),
    title: 'Estilos Pequeños | Ropa para niños',
  },
  {
    path: 'producto/:id',
    loadComponent: () =>
      import('./features/product-detail/product-detail-page/product-detail-page.component').then(
        (m) => m.ProductDetailPageComponent
      ),
    title: 'Producto | Estilos Pequeños',
  },
  {
    path: 'carrito',
    loadComponent: () =>
      import('./features/cart/cart-page/cart-page.component').then((m) => m.CartPageComponent),
    title: 'Carrito | Estilos Pequeños',
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./features/admin/admin-login/admin-login.component').then(
        (m) => m.AdminLoginComponent
      ),
    title: 'Ingresar | Admin',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'productos', pathMatch: 'full' },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/admin/admin-products/admin-products.component').then(
            (m) => m.AdminProductsComponent
          ),
        title: 'Productos | Admin',
      },
      {
        path: 'productos/nuevo',
        loadComponent: () =>
          import('./features/admin/admin-product-form/admin-product-form.component').then(
            (m) => m.AdminProductFormComponent
          ),
        title: 'Nuevo producto | Admin',
      },
      {
        path: 'productos/:id/editar',
        loadComponent: () =>
          import('./features/admin/admin-product-form/admin-product-form.component').then(
            (m) => m.AdminProductFormComponent
          ),
        title: 'Editar producto | Admin',
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./features/admin/admin-orders/admin-orders.component').then(
            (m) => m.AdminOrdersComponent
          ),
        title: 'Pedidos | Admin',
      },
      {
        path: 'pedidos/:id',
        loadComponent: () =>
          import('./features/admin/admin-order-detail/admin-order-detail.component').then(
            (m) => m.AdminOrderDetailComponent
          ),
        title: 'Pedido | Admin',
      },
      {
        path: 'carrusel',
        loadComponent: () =>
          import('./features/admin/admin-hero-slides/admin-hero-slides.component').then(
            (m) => m.AdminHeroSlidesComponent
          ),
        title: 'Carrusel | Admin',
      },
      {
        path: 'parametrias',
        loadComponent: () =>
          import('./features/admin/admin-params/admin-params.component').then(
            (m) => m.AdminParamsComponent
          ),
        title: 'Parametrías | Admin',
      },
      {
        path: 'proveedores',
        loadComponent: () =>
          import('./features/admin/admin-suppliers/admin-suppliers.component').then(
            (m) => m.AdminSuppliersComponent
          ),
        title: 'Proveedores | Admin',
      },
      {
        path: 'promociones',
        loadComponent: () =>
          import('./features/admin/admin-promos/admin-promos.component').then(
            (m) => m.AdminPromosComponent
          ),
        title: 'Descuentos | Admin',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
