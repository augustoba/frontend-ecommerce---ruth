import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-[calc(100vw-2rem)] w-80">
      @for (t of toastService.toasts(); track t.id) {
        <div
          class="rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ring-1 ring-black/5 flex items-start gap-2 animate-[slidein_.15s_ease-out]"
          [class.bg-mint-100]="t.kind === 'success'"
          [class.text-mint-800]="t.kind === 'success'"
          [class.bg-red-100]="t.kind === 'error'"
          [class.text-red-800]="t.kind === 'error'"
          [class.bg-brand-100]="t.kind === 'info'"
          [class.text-brand-800]="t.kind === 'info'"
        >
          <span aria-hidden="true">{{ t.kind === 'success' ? '✅' : t.kind === 'error' ? '⚠️' : 'ℹ️' }}</span>
          <span class="flex-1">{{ t.message }}</span>
          <button
            type="button"
            (click)="toastService.dismiss(t.id)"
            class="shrink-0 opacity-60 hover:opacity-100"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slidein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  `],
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
