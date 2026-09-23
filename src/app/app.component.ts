import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { SessionBannerComponent } from './shared/components/session-banner/session-banner.component';
import { WhatsappFloatComponent } from './shared/components/whatsapp-float/whatsapp-float.component';
import { PromoBannerComponent } from './shared/components/promo-banner/promo-banner.component';

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
  /** El panel de administración tiene su propio layout, así que ocultamos header/footer públicos ahí */
  readonly isAdminRoute = signal(false);

  constructor(router: Router) {
    router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.isAdminRoute.set(e.urlAfterRedirects.startsWith('/admin')));
  }
}
