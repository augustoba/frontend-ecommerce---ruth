import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Agrega `Authorization: Bearer <jwt>` a toda request a NUESTRO backend
 * (cualquier URL armada con `apiUrl()`, siempre tiene `/api/` — nunca a
 * dominios de terceros como Cloudinary, que van por `fetch` nativo, no por
 * `HttpClient`) cuando hay sesión activa.
 *
 * Antes esto sólo viajaba en `/api/admin/**`/`/api/auth/me`: varias
 * pantallas del panel (ej. el listado de productos, que resuelve nombres de
 * parametría vía `/api/param-groups`) en realidad pegan también a endpoints
 * "públicos" de sólo lectura, reusados por el sitio real y por el panel en
 * vez de duplicarlos bajo `/api/admin/`. Sin el token ahí, el backend no
 * puede distinguir esas llamadas del panel de las de un visitante anónimo
 * — hace falta esa distinción para el freno de "tienda sin sitio online"/
 * "pausada" del panel (Fase 14, ver `TenantResolutionFilter`), que nunca
 * tiene que bloquear al propio panel de administración.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const needsAuth = req.url.includes('/api/');
  const token = auth.token();

  if (needsAuth && token) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
  return next(req);
};
