import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { TitleStrategy, provideRouter, withInMemoryScrolling } from '@angular/router';
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
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    { provide: LOCALE_ID, useValue: 'es-AR' },
    { provide: TitleStrategy, useClass: StoreTitleStrategy },
    CurrencyPipe,
  ],
};
