import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { CldImagePipe } from '../../pipes/cld-image.pipe';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CldImagePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly cartService = inject(CartService);
  private readonly settingsService = inject(SettingsService);
  private readonly router = inject(Router);

  readonly totalItems = this.cartService.totalItems;
  readonly storeName = computed(() => this.settingsService.settings().storeName);
  readonly logoSrc = this.settingsService.logoSrc;

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
