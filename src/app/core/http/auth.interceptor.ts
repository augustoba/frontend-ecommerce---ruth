import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Agrega `Authorization: Bearer <jwt>` a las requests que lo necesitan:
 * todo `/api/admin/**` y `/api/auth/me` (que dice quién soy y qué permisos tengo).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const needsAuth = req.url.includes('/api/admin/') || req.url.includes('/api/auth/me');
  const token = auth.token();

  if (needsAuth && token) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
  return next(req);
};
