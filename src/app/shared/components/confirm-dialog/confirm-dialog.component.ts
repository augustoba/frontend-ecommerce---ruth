import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [FormsModule],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  private readonly confirmService = inject(ConfirmService);
  readonly pending = this.confirmService.pending;
  readonly inputValue = signal('');

  readonly confirmLabel = computed(() => this.pending()?.confirmLabel ?? 'Confirmar');
  readonly cancelLabel = computed(() => this.pending()?.cancelLabel ?? 'Cancelar');

  constructor() {
    effect(() => {
      const p = this.pending();
      this.inputValue.set(p?.input?.initial ?? '');
    });
  }

  cancel(): void {
    this.confirmService.resolve(this.pending()?.input ? null : false);
  }

  accept(): void {
    const p = this.pending();
    this.confirmService.resolve(p?.input ? this.inputValue() : true);
  }
}
