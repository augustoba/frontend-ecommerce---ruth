/**
 * Configuración general de la tienda.
 *
 * ⚠️ IMPORTANTE: reemplazá los valores de acá antes de publicar el sitio.
 */
export const SITE_CONFIG = {
  storeName: 'Estilos Pequeños',

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

  /**
   * Credenciales del panel de administración. Esto es un login MUY simple
   * pensado solo para esta primera versión sin backend: evita que cualquiera
   * entre a /admin por casualidad, pero NO es seguro (las credenciales viven
   * en el código del frontend). Cuando el backend en Java esté listo,
   * hay que reemplazar AuthService por un login real contra la API.
   */
  admin: {
    username: 'admin',
    password: 'cambiar-esta-clave',
  },
};
