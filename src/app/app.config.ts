import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { TitleStrategy, provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { CurrencyPipe, registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';

import { routes } from './app.routes';
import { authInterceptor } from './core/http/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { StoreTitleStrategy } from './core/store-title.strategy';

registerLocaleData(localeEsAr, 'es-AR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      // View Transitions para el diseño Portal (la foto de la prenda viaja a la
      // ficha). En cualquier otro diseño —y en /admin, que no lleva
      // `data-layout`— `styles.css` les saca la animación
      // (`html:not([data-layout="portal"])::view-transition-*`), así que navegar
      // sigue siendo instantáneo. Va por CSS y no con `skipTransition()` porque
      // saltearla rechaza una promesa del navegador y ensucia la consola.
      withViewTransitions({ skipInitialTransition: true })
    ),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    { provide: LOCALE_ID, useValue: 'es-AR' },
    { provide: TitleStrategy, useClass: StoreTitleStrategy },
    CurrencyPipe,
  ],
};
