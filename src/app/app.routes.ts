import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { productResolver } from './features/admin/admin-product-form/product.resolver';
import { orderResolver } from './features/admin/admin-order-detail/order.resolver';

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
    path: 'como-comprar',
    loadComponent: () =>
      import('./features/help/como-comprar-page/como-comprar-page.component').then(
        (m) => m.ComoComprarPageComponent
      ),
    title: 'Cómo comprar | Estilos Pequeños',
  },
  {
    path: 'mis-pedidos',
    loadComponent: () =>
      import('./features/orders/mis-pedidos-page/mis-pedidos-page.component').then(
        (m) => m.MisPedidosPageComponent
      ),
    title: 'Mis pedidos | Estilos Pequeños',
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
    path: 'admin/recuperar',
    loadComponent: () =>
      import('./features/admin/admin-recover/admin-recover.component').then(
        (m) => m.AdminRecoverComponent
      ),
    title: 'Recuperar contraseña | Admin',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
        title: 'Inicio | Admin',
      },
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
        resolve: { product: productResolver },
        title: 'Nuevo producto | Admin',
      },
      {
        path: 'productos/:id/editar',
        loadComponent: () =>
          import('./features/admin/admin-product-form/admin-product-form.component').then(
            (m) => m.AdminProductFormComponent
          ),
        resolve: { product: productResolver },
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
        resolve: { order: orderResolver },
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
        path: 'talles',
        loadComponent: () =>
          import('./features/admin/admin-size-scales/admin-size-scales.component').then(
            (m) => m.AdminSizeScalesComponent
          ),
        title: 'Talles | Admin',
      },
      {
        path: 'promociones',
        loadComponent: () =>
          import('./features/admin/admin-promos/admin-promos.component').then(
            (m) => m.AdminPromosComponent
          ),
        title: 'Descuentos | Admin',
      },
      {
        path: 'cupones',
        loadComponent: () =>
          import('./features/admin/admin-coupons/admin-coupons.component').then(
            (m) => m.AdminCouponsComponent
          ),
        title: 'Cupones | Admin',
      },
      {
        path: 'metricas',
        loadComponent: () =>
          import('./features/admin/admin-metrics/admin-metrics.component').then(
            (m) => m.AdminMetricsComponent
          ),
        title: 'Métricas | Admin',
      },
      {
        path: 'config',
        loadComponent: () =>
          import('./features/admin/admin-config/admin-config-hub.component').then(
            (m) => m.AdminConfigHubComponent
          ),
        title: 'Configuración del sitio | Admin',
      },
      {
        path: 'config/identidad',
        loadComponent: () =>
          import('./features/admin/admin-config/admin-config-section.component').then(
            (m) => m.AdminConfigSectionComponent
          ),
        data: { section: 'identity' },
        title: 'Identidad y contacto | Admin',
      },
      {
        path: 'config/redes',
        loadComponent: () =>
          import('./features/admin/admin-config/admin-config-section.component').then(
            (m) => m.AdminConfigSectionComponent
          ),
        data: { section: 'social' },
        title: 'Redes sociales | Admin',
      },
      {
        path: 'config/nosotros',
        loadComponent: () =>
          import('./features/admin/admin-config/admin-config-section.component').then(
            (m) => m.AdminConfigSectionComponent
          ),
        data: { section: 'about' },
        title: 'Sobre nosotros | Admin',
      },
      {
        path: 'config/whatsapp',
        loadComponent: () =>
          import('./features/admin/admin-config/admin-config-section.component').then(
            (m) => m.AdminConfigSectionComponent
          ),
        data: { section: 'whatsapp' },
        title: 'Mensaje de WhatsApp | Admin',
      },
      {
        path: 'config/pagos',
        loadComponent: () =>
          import('./features/admin/admin-config/admin-config-section.component').then(
            (m) => m.AdminConfigSectionComponent
          ),
        data: { section: 'pagos' },
        title: 'Medios de pago | Admin',
      },
      {
        path: 'config/ayuda',
        loadComponent: () =>
          import('./features/admin/admin-help/admin-help.component').then((m) => m.AdminHelpComponent),
        title: 'Cómo comprar + FAQ | Admin',
      },
      { path: 'ajustes', redirectTo: 'config', pathMatch: 'full' },
      {
        path: 'cuenta',
        loadComponent: () =>
          import('./features/admin/admin-account/admin-account.component').then(
            (m) => m.AdminAccountComponent
          ),
        title: 'Mi cuenta | Admin',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
