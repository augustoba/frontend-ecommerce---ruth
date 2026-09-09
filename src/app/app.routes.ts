import { Routes } from '@angular/router';
import { adminGuard, permissionGuard } from './core/guards/admin.guard';
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
    path: 'admin/recibo/:id',
    canActivate: [adminGuard, permissionGuard],
    data: { permission: 'ORDERS_VIEW' },
    loadComponent: () =>
      import('./features/admin/admin-receipt/admin-receipt.component').then(
        (m) => m.AdminReceiptComponent
      ),
    resolve: { order: orderResolver },
    title: 'Recibo',
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
        canActivate: [permissionGuard],
        data: { permission: 'PRODUCTS_VIEW' },
        loadComponent: () =>
          import('./features/admin/admin-products/admin-products.component').then(
            (m) => m.AdminProductsComponent
          ),
        title: 'Productos | Admin',
      },
      {
        path: 'productos/nuevo',
        canActivate: [permissionGuard],
        data: { permission: 'PRODUCTS_MANAGE' },
        loadComponent: () =>
          import('./features/admin/admin-product-form/admin-product-form.component').then(
            (m) => m.AdminProductFormComponent
          ),
        resolve: { product: productResolver },
        title: 'Nuevo producto | Admin',
      },
      {
        path: 'productos/:id/editar',
        canActivate: [permissionGuard],
        data: { permission: 'PRODUCTS_MANAGE' },
        loadComponent: () =>
          import('./features/admin/admin-product-form/admin-product-form.component').then(
            (m) => m.AdminProductFormComponent
          ),
        resolve: { product: productResolver },
        title: 'Editar producto | Admin',
      },
      {
        path: 'ventas/nueva',
        canActivate: [permissionGuard],
        data: { permission: 'POS_USE' },
        loadComponent: () =>
          import('./features/admin/admin-pos/admin-pos.component').then((m) => m.AdminPosComponent),
        title: 'Venta en el local | Admin',
      },
      {
        path: 'cambios',
        canActivate: [permissionGuard],
        data: { permission: 'POS_USE' },
        loadComponent: () =>
          import('./features/admin/admin-exchange/admin-exchanges.component').then(
            (m) => m.AdminExchangesComponent
          ),
        title: 'Cambios | Admin',
      },
      {
        path: 'caja',
        canActivate: [permissionGuard],
        data: { permission: 'POS_USE' },
        loadComponent: () =>
          import('./features/admin/admin-cash-register/admin-cash-register.component').then(
            (m) => m.AdminCashRegisterComponent
          ),
        title: 'Caja | Admin',
      },
      {
        path: 'cambios/nuevo',
        canActivate: [permissionGuard],
        data: { permission: 'POS_USE' },
        loadComponent: () =>
          import('./features/admin/admin-exchange/admin-exchange-new.component').then(
            (m) => m.AdminExchangeNewComponent
          ),
        title: 'Registrar cambio | Admin',
      },
      {
        path: 'pedidos',
        canActivate: [permissionGuard],
        data: { permission: 'ORDERS_VIEW' },
        loadComponent: () =>
          import('./features/admin/admin-orders/admin-orders.component').then(
            (m) => m.AdminOrdersComponent
          ),
        title: 'Pedidos | Admin',
      },
      {
        path: 'pedidos/:id',
        canActivate: [permissionGuard],
        data: { permission: 'ORDERS_VIEW' },
        loadComponent: () =>
          import('./features/admin/admin-order-detail/admin-order-detail.component').then(
            (m) => m.AdminOrderDetailComponent
          ),
        resolve: { order: orderResolver },
        title: 'Pedido | Admin',
      },
      {
        path: 'carrusel',
        canActivate: [permissionGuard],
        data: { permission: 'CAROUSEL_MANAGE' },
        loadComponent: () =>
          import('./features/admin/admin-hero-slides/admin-hero-slides.component').then(
            (m) => m.AdminHeroSlidesComponent
          ),
        title: 'Carrusel | Admin',
      },
      {
        path: 'parametrias',
        canActivate: [permissionGuard],
        data: { permission: 'PARAMS_MANAGE' },
        loadComponent: () =>
          import('./features/admin/admin-params/admin-params.component').then(
            (m) => m.AdminParamsComponent
          ),
        title: 'Parametrías | Admin',
      },
      {
        path: 'proveedores',
        canActivate: [permissionGuard],
        data: { permission: 'SUPPLIERS_MANAGE' },
        loadComponent: () =>
          import('./features/admin/admin-suppliers/admin-suppliers.component').then(
            (m) => m.AdminSuppliersComponent
          ),
        title: 'Proveedores | Admin',
      },
      {
        path: 'talles',
        canActivate: [permissionGuard],
        data: { permission: 'SIZE_SCALES_MANAGE' },
        loadComponent: () =>
          import('./features/admin/admin-size-scales/admin-size-scales.component').then(
            (m) => m.AdminSizeScalesComponent
          ),
        title: 'Talles | Admin',
      },
      {
        path: 'promociones',
        canActivate: [permissionGuard],
        data: { permission: 'DISCOUNTS_MANAGE' },
        loadComponent: () =>
          import('./features/admin/admin-promos/admin-promos.component').then(
            (m) => m.AdminPromosComponent
          ),
        title: 'Descuentos | Admin',
      },
      {
        path: 'cupones',
        canActivate: [permissionGuard],
        data: { permission: 'COUPONS_MANAGE' },
        loadComponent: () =>
          import('./features/admin/admin-coupons/admin-coupons.component').then(
            (m) => m.AdminCouponsComponent
          ),
        title: 'Cupones | Admin',
      },
      {
        path: 'usuarios',
        canActivate: [permissionGuard],
        data: { permission: 'USERS_MANAGE' },
        loadComponent: () =>
          import('./features/admin/admin-users/admin-users.component').then(
            (m) => m.AdminUsersComponent
          ),
        title: 'Usuarios y roles | Admin',
      },
      {
        path: 'metricas',
        canActivate: [permissionGuard],
        data: { permission: 'METRICS_VIEW' },
        loadComponent: () =>
          import('./features/admin/admin-metrics/admin-metrics.component').then(
            (m) => m.AdminMetricsComponent
          ),
        title: 'Métricas | Admin',
      },
      {
        path: 'config',
        canActivate: [permissionGuard],
        data: { permission: 'SETTINGS_MANAGE' },
        loadComponent: () =>
          import('./features/admin/admin-config/admin-config-hub.component').then(
            (m) => m.AdminConfigHubComponent
          ),
        title: 'Configuración del sitio | Admin',
      },
      {
        path: 'config/identidad',
        canActivate: [permissionGuard],
        data: { section: 'identity', permission: 'SETTINGS_MANAGE' },
        loadComponent: () =>
          import('./features/admin/admin-config/admin-config-section.component').then(
            (m) => m.AdminConfigSectionComponent
          ),
        title: 'Identidad y contacto | Admin',
      },
      {
        path: 'config/redes',
        canActivate: [permissionGuard],
        data: { section: 'social', permission: 'SETTINGS_MANAGE' },
        loadComponent: () =>
          import('./features/admin/admin-config/admin-config-section.component').then(
            (m) => m.AdminConfigSectionComponent
          ),
        title: 'Redes sociales | Admin',
      },
      {
        path: 'config/nosotros',
        canActivate: [permissionGuard],
        data: { section: 'about', permission: 'SETTINGS_MANAGE' },
        loadComponent: () =>
          import('./features/admin/admin-config/admin-config-section.component').then(
            (m) => m.AdminConfigSectionComponent
          ),
        title: 'Sobre nosotros | Admin',
      },
      {
        path: 'config/whatsapp',
        canActivate: [permissionGuard],
        data: { section: 'whatsapp', permission: 'SETTINGS_MANAGE' },
        loadComponent: () =>
          import('./features/admin/admin-config/admin-config-section.component').then(
            (m) => m.AdminConfigSectionComponent
          ),
        title: 'Mensaje de WhatsApp | Admin',
      },
      {
        path: 'config/pagos',
        canActivate: [permissionGuard],
        data: { section: 'pagos', permission: 'SETTINGS_MANAGE' },
        loadComponent: () =>
          import('./features/admin/admin-config/admin-config-section.component').then(
            (m) => m.AdminConfigSectionComponent
          ),
        title: 'Medios de pago | Admin',
      },
      {
        path: 'config/ayuda',
        canActivate: [permissionGuard],
        data: { permission: 'SETTINGS_MANAGE' },
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
