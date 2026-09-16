import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { SettingsService } from '../../../core/services/settings.service';
import { ThemeModeService } from '../../../core/services/theme-mode.service';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, LogoComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly cartService = inject(CartService);
  private readonly settingsService = inject(SettingsService);
  private readonly router = inject(Router);
  readonly themeMode = inject(ThemeModeService);

  readonly totalItems = this.cartService.totalItems;
  readonly storeName = computed(() => this.settingsService.settings().storeName);
  readonly logoSrc = this.settingsService.logoSrc;
  /** null = queda el fondo/texto por defecto (clases de siempre, con su variante oscura). */
  readonly headerBg = computed(() => this.settingsService.settings().headerColor || null);
  readonly titleColor = computed(() => this.settingsService.settings().textColor || null);

  private readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.split(/[?#]/)[0]),
      startWith(this.router.url.split(/[?#]/)[0])
    ),
    { initialValue: this.router.url.split(/[?#]/)[0] }
  );
  readonly onHome = computed(() => this.currentPath() === '/');

  /** "Catálogo": si ya estás en la home baja a la grilla; si no, va a la home y baja. */
  goToCatalog(event: Event): void {
    event.preventDefault();
    if (this.onHome()) {
      scrollToCatalog();
    } else {
      this.router.navigateByUrl('/').then(() => setTimeout(scrollToCatalog, 120));
    }
  }
}

function scrollToCatalog(): void {
  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
