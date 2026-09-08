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
};

/** Arma la URL de un endpoint del backend: apiUrl('/products') → '/api/products' */
export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CONFIG.apiBaseUrl}/api${p}`;
}
