import { Component, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { SessionBannerComponent } from './shared/components/session-banner/session-banner.component';
import { WhatsappFloatComponent } from './shared/components/whatsapp-float/whatsapp-float.component';
import { PromoBannerComponent } from './shared/components/promo-banner/promo-banner.component';
import { SettingsService } from './core/services/settings.service';
import { ensureLayoutFonts } from './core/layouts';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ToastComponent,
    ConfirmDialogComponent,
    SessionBannerComponent,
    WhatsappFloatComponent,
    PromoBannerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly settingsService = inject(SettingsService);

  /** El panel de administración tiene su propio layout, así que ocultamos header/footer públicos ahí */
  readonly isAdminRoute = signal(false);

  constructor(router: Router) {
    router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.isAdminRoute.set(e.urlAfterRedirects.startsWith('/admin')));

    // Único lugar que escribe `data-layout` en <html>. Lo lee `styles.css` para
    // cambiar fuentes y aire de TODA la tienda (header, footer y páginas
    // incluidas), no sólo de la home. En el admin se saca: el backoffice tiene
    // su propia identidad y no debe heredarse del diseño que elija el cliente.
    effect(() => {
      const id = this.settingsService.layout();
      const root = document.documentElement;
      if (this.isAdminRoute()) {
        root.removeAttribute('data-layout');
        return;
      }
      root.setAttribute('data-layout', id);
      ensureLayoutFonts(id);
    });
  }
}
