import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { SettingsService } from '../../../core/services/settings.service';
import { DashboardService } from '../../../core/services/dashboard.service';

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

  readonly storeName = computed(() => this.settingsService.settings().storeName);
  readonly pendingOrders = this.orderService.pendingCount;
  readonly lowStockCount = this.dashboardService.lowStockCount;

  constructor() {
    this.orderService.ensureLoaded();
    this.dashboardService.ensureLowStockLoaded();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
