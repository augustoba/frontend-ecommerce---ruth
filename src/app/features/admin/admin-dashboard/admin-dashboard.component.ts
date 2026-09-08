import { Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CurrencyPipe, DatePipe, RouterLink, SkeletonComponent],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  private readonly dashboardService = inject(DashboardService);

  readonly status = this.dashboardService.status;
  readonly dashboard = this.dashboardService.dashboard;
  readonly reload = () => this.dashboardService.loadDashboard();

  constructor() {
    this.dashboardService.loadDashboard();
  }
}
