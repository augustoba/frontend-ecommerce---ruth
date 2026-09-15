import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DemoTenantService } from '../services/demo-tenant.service';

/** Agrega `X-Demo-Tenant: <slug>` a las requests al backend propio mientras haya una tienda demo elegida (ver DemoTenantService). */
export const demoTenantInterceptor: HttpInterceptorFn = (req, next) => {
  const demoTenant = inject(DemoTenantService);
  const slug = demoTenant.slug();

  if (slug && req.url.includes('/api/')) {
    return next(req.clone({ setHeaders: { 'X-Demo-Tenant': slug } }));
  }
  return next(req);
};
