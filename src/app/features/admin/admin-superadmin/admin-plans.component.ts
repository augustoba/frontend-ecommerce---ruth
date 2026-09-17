import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PlanAdminService } from '../../../core/services/plan-admin.service';
import { PlanEditorComponent } from './plan-editor.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

/**
 * ABM de planes comerciales — sólo superadmin (ver `superAdminGuard` en la
 * ruta y `SUPERADMIN` authority en el backend). Reemplaza el `UPDATE` a
 * mano en `plan_module` que se usaba hasta ahora (ver PLAN_SAAS.md).
 */
@Component({
  selector: 'app-admin-plans',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PlanEditorComponent, SkeletonComponent],
  templateUrl: './admin-plans.component.html',
})
export class AdminPlansComponent {
  private readonly planAdmin = inject(PlanAdminService);

  readonly plans = this.planAdmin.plans;
  readonly status = this.planAdmin.status;

  constructor() {
    this.planAdmin.ensureLoaded();
  }

  reload(): void {
    this.planAdmin.reload();
  }
}
