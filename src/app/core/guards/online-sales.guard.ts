import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { SettingsService } from '../services/settings.service';

/**
 * Protege `/carrito`: con la venta online apagada (modo vidriera) manda al
 * catálogo. Espera a que llegue `/api/settings` para no decidir con el default.
 */
export const onlineSalesGuard: CanActivateFn = () => {
  const settings = inject(SettingsService);
  const router = inject(Router);
  settings.ensureLoaded();
  return toObservable(settings.status).pipe(
    filter((s) => s === 'loaded' || s === 'error'),
    take(1),
    map(() => (settings.settings().onlineSalesEnabled ? true : router.createUrlTree(['/'])))
  );
};
