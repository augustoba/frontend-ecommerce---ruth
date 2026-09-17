/** Módulos gateables por plan (ver `core/plan/Modules.java` en el backend). */
export interface ModuleOption {
  key: string;
  label: string;
  description: string;
}

export const MODULE_OPTIONS: ModuleOption[] = [
  {
    key: 'SOCIAL_SHARE',
    label: 'Publicar en redes',
    description: 'Botón "Publicar en redes" en productos, para compartir foto + texto por WhatsApp/Instagram desde el celular.',
  },
  {
    key: 'MERCADOPAGO',
    label: 'Mercado Pago',
    description: 'Checkout con pago online real en el carrito público (cada tienda carga sus propias credenciales).',
  },
  {
    key: 'ECOMMERCE_SITE',
    label: 'Sitio web (ecommerce)',
    description: 'El sitio público en sí — catálogo, carrito, checkout. Sin esto, el tenant no tiene vidriera online, sólo panel de administración.',
  },
  {
    key: 'POS',
    label: 'Punto de venta (kiosco)',
    description: 'Pantalla de venta presencial con código de barras, pensada para negocios sin ecommerce (kiosco, casa de repuestos).',
  },
  {
    key: 'ARCA_INVOICING',
    label: 'Factura electrónica (ARCA)',
    description: 'Factura A/B/C real con CAE vía ARCA — cada tienda carga su propio CUIT y certificado. Sin esto, el punto de venta sólo emite ticket interno.',
  },
];
