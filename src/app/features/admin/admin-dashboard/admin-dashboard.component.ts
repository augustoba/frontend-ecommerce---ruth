import { Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { LowStockItem } from '../../../core/models/dashboard.model';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CurrencyPipe, DatePipe, RouterLink, SkeletonComponent],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);

  readonly status = this.dashboardService.status;
  readonly dashboard = this.dashboardService.dashboard;
  readonly lowStockItems = this.dashboardService.lowStock;
  readonly lowStockCount = this.dashboardService.lowStockCount;
  readonly lowStockTotal = this.dashboardService.lowStockTotal;
  readonly reload = () => this.dashboardService.loadDashboard();

  isSeen = (item: LowStockItem): boolean => this.dashboardService.isLowStockSeen(item);
  markSeen = (item: LowStockItem): void => this.dashboardService.markLowStockSeen(item);

  /** "No reponer": saca el producto de la lista de reposición (reversible desde el producto). */
  noRestock(item: LowStockItem): void {
    this.dashboardService.removeProductFromLowStock(item.productId);
    this.productService.setDiscontinued(item.productId, true, () =>
      this.toast.success(`"${item.productName}" ya no aparece en reposición. Lo revertís desde el producto.`)
    );
  }

  constructor() {
    this.dashboardService.loadDashboard();
  }
}
