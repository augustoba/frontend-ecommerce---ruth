/**
 * Configuración general de la tienda.
 *
 * ⚠️ IMPORTANTE: reemplazá los valores de acá antes de publicar el sitio.
 */
export const SITE_CONFIG = {
  storeName: 'Estilos Pequeños',

  /**
   * Base del backend. Vacío = usa el proxy del dev-server (`ng serve` redirige
   * `/api/*` a http://localhost:8080). En producción, poné acá la URL del
   * backend (ej: 'https://api.estilospequenos.com') si va en otro dominio.
   */
  apiBaseUrl: '',

  /**
   * Número de WhatsApp del dueño/a del local, en formato internacional
   * SIN espacios, SIN "+" y SIN guiones. Ejemplo Argentina (Buenos Aires,
   * celular): país 54 + 9 + código de área sin 0 + número sin 15.
   * "5491122334455" → +54 9 11 2233-4455
   */
  whatsappNumber: '5491122334455',

  /** Texto corto para el "Sobre nosotros" del pie de página */
  about:
    'Somos Estilos Pequeños 🧸 Hace 5 años vestimos a los más chicos con ropa cómoda, ' +
    'de calidad y con onda. Elegimos cada prenda pensando en la comodidad de los peques ' +
    'y la tranquilidad de las familias. ¡Gracias por elegirnos!',

  redes: {
    instagram: 'estilospequenos_',
    facebookUrl: 'https://www.facebook.com/share/1NZXdYgick/',
  },
};

/** Arma la URL de un endpoint del backend: apiUrl('/products') → '/api/products' */
export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CONFIG.apiBaseUrl}/api${p}`;
}
