import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { SettingsService } from '../../../core/services/settings.service';
import { DashboardService } from '../../../core/services/dashboard.service';

interface NavItem {
  path: string;
  label: string;
  /** Contador a mostrar como badge (se resuelve en el template). */
  badge?: 'pending';
  /** Ruta exacta (para no marcar activo en sub-rutas). */
  exact?: boolean;
}

interface NavGroup {
  id: string;
  label: string;
  icon: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    id: 'ventas',
    label: 'Ventas',
    icon: '🧾',
    items: [
      { path: '/admin/pedidos', label: 'Pedidos', badge: 'pending' },
      { path: '/admin/promociones', label: 'Descuentos' },
      { path: '/admin/metricas', label: 'Métricas' },
    ],
  },
  {
    id: 'catalogo',
    label: 'Catálogo',
    icon: '📦',
    items: [
      { path: '/admin/productos', label: 'Productos' },
      { path: '/admin/parametrias', label: 'Parametrías' },
      { path: '/admin/talles', label: 'Talles' },
      { path: '/admin/proveedores', label: 'Proveedores' },
    ],
  },
  {
    id: 'config',
    label: 'Configuración del sitio',
    icon: '🎨',
    items: [
      { path: '/admin/config', label: 'Vista general', exact: true },
      { path: '/admin/config/identidad', label: 'Identidad y contacto' },
      { path: '/admin/config/whatsapp', label: 'Mensaje de WhatsApp' },
      { path: '/admin/config/pagos', label: 'Medios de pago' },
      { path: '/admin/config/redes', label: 'Redes sociales' },
      { path: '/admin/config/nosotros', label: 'Sobre nosotros' },
      { path: '/admin/config/ayuda', label: 'Cómo comprar + FAQ' },
      { path: '/admin/carrusel', label: 'Carrusel' },
    ],
  },
];

const STORAGE_KEY = 'ep_admin_menu_open';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly settingsService = inject(SettingsService);
  private readonly dashboardService = inject(DashboardService);

  readonly groups = GROUPS;
  readonly storeName = computed(() => this.settingsService.settings().storeName);
  readonly logoSrc = this.settingsService.logoSrc;
  readonly pendingOrders = this.orderService.pendingCount;
  readonly lowStockCount = this.dashboardService.lowStockCount;

  /** URL actual (para saber qué grupo está activo). */
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  /** Grupos abiertos en el acordeón. */
  private readonly openGroups = signal<Set<string>>(this.readOpen());

  /** true si algún item del grupo matchea la ruta actual. */
  groupIsActive(group: NavGroup): boolean {
    const url = this.currentUrl();
    return group.items.some((it) => (it.exact ? url === it.path : url.startsWith(it.path)));
  }

  isOpen(group: NavGroup): boolean {
    return this.openGroups().has(group.id) || this.groupIsActive(group);
  }

  toggleGroup(id: string): void {
    const next = new Set(this.openGroups());
    next.has(id) ? next.delete(id) : next.add(id);
    this.openGroups.set(next);
    this.persistOpen(next);
  }

  /** Badge total del grupo cuando está colapsado (hoy: sólo pedidos pendientes). */
  groupBadge(group: NavGroup): number {
    return group.items.some((it) => it.badge === 'pending') ? this.pendingOrders() : 0;
  }

  // --- Drawer mobile ---

  readonly drawerOpen = signal(false);

  constructor() {
    this.orderService.ensureLoaded();
    this.dashboardService.ensureLowStockLoaded();
    // cerrar el menú mobile al navegar
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.drawerOpen.set(false));
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

  private readOpen(): Set<string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? (JSON.parse(raw) as unknown) : [];
      return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : []);
    } catch {
      return new Set();
    }
  }

  private persistOpen(open: Set<string>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...open]));
    } catch {
      /* sin persistencia: el acordeón sigue andando en memoria */
    }
  }
}
