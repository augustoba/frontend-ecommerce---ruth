/**
 * Configuración del frontend que NO puede venir del backend (chicken/egg:
 * hace falta para saber a dónde llamar). El resto de los "datos del local"
 * (nombre, WhatsApp, redes, "sobre nosotros") se editan desde
 * `/admin/config` y viven en el backend — ver `SettingsService`.
 */
export const SITE_CONFIG = {
  /**
   * Base del backend. Vacío = usa el proxy del dev-server (`ng serve` redirige
   * `/api/*` a http://localhost:8080). En producción, poné acá la URL del
   * backend si va en otro dominio (ej: 'https://api.estilospequenos.com').
   */
  apiBaseUrl: '',

  /**
   * Cloudinary — subida de fotos de productos directo desde el navegador.
   * Los dos valores son PÚBLICOS (van en el bundle sin problema):
   *  - `cloudName`: el "Cloud name" de la cuenta (dashboard de Cloudinary).
   *  - `uploadPreset`: un **unsigned upload preset**
   *    (Settings → Upload → Upload presets → Add unsigned preset). Conviene
   *    configurarle carpeta (`estilos-pequenos/productos`), formatos permitidos
   *    (jpg,png,webp) y un límite de tamaño.
   * Si quedan vacíos, el form de producto sólo deja agregar fotos pegando su URL.
   */
  cloudinary: {
    cloudName: 'jitutkbc',
    uploadPreset: 'estilospequenos',
  },
};

/** true si están cargados el cloud name y el upload preset de Cloudinary. */
export function cloudinaryConfigured(): boolean {
  return !!(SITE_CONFIG.cloudinary.cloudName && SITE_CONFIG.cloudinary.uploadPreset);
}

/** Arma la URL de un endpoint del backend: apiUrl('/products') → '/api/products' */
export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CONFIG.apiBaseUrl}/api${p}`;
}
