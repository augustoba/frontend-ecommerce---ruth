import { Component, inject } from '@angular/core';
import { PageBlocksService, BLOCK_LABELS } from '../../../core/services/page-blocks.service';

@Component({
  selector: 'app-admin-page-blocks',
  imports: [],
  templateUrl: './admin-page-blocks.component.html',
  styleUrl: './admin-page-blocks.component.css',
})
export class AdminPageBlocksComponent {
  private readonly pageBlocksService = inject(PageBlocksService);

  readonly blocks = this.pageBlocksService.adminBlocks;
  readonly status = this.pageBlocksService.adminStatus;
  readonly saving = this.pageBlocksService.adminSaving;
  readonly reload = () => this.pageBlocksService.adminReload();

  constructor() {
    this.pageBlocksService.ensureAdminLoaded();
  }

  labelFor(blockType: string): string {
    return BLOCK_LABELS[blockType] ?? blockType;
  }

  toggle(id: string, currentlyVisible: boolean): void {
    this.pageBlocksService.setVisible(id, !currentlyVisible);
  }
}
