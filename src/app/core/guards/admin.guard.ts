import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Permission } from '../models/permission.model';

/** Protege `/admin/**`: requiere estar logueado. Además asegura que `me` esté cargado. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/admin/login']);
  }
  if (auth.me()) return true;
  // Cargar los permisos antes de dejar entrar (para que las sub-rutas los puedan chequear).
  return auth.loadMe().pipe(map(() => true));
};

/**
 * Protege una ruta del panel por permiso: `data: { permission: 'X' }`.
 * Si el usuario no lo tiene, lo manda al inicio del panel.
 */
export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const needed = route.data['permission'] as Permission | undefined;

  const check = () =>
    !needed || auth.has(needed) ? true : router.createUrlTree(['/admin']);

  if (auth.me()) return check();
  return auth.loadMe().pipe(map(check));
};

/**
 * Protege rutas de `/admin/superadmin/**`: sólo el usuario superadmin (vos,
 * seedeado por variables de entorno — ver `AuthService.ensureSuperAdmin` en el
 * backend). No es un `Permission` normal: no se puede otorgar desde `/admin/usuarios`.
 */
export const superAdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const check = () => (auth.isSuperAdmin() ? true : router.createUrlTree(['/admin']));

  if (auth.me()) return check();
  return auth.loadMe().pipe(map(check));
};
