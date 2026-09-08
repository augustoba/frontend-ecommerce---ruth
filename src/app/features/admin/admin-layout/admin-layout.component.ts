import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { SITE_CONFIG } from '../../../core/config/site-config';

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

  readonly storeName = SITE_CONFIG.storeName;
  readonly pendingOrders = this.orderService.pendingCount;

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
