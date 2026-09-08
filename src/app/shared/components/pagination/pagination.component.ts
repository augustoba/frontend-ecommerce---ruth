import { Component, computed, input, output } from '@angular/core';

/** Controles de paginación (anterior / siguiente + "página X de Y"). `page` es 0-based. */
@Component({
  selector: 'app-pagination',
  template: `
    @if (totalPages() > 1) {
      <div class="flex items-center justify-center gap-3 mt-4 text-sm">
        <button
          type="button"
          (click)="go(page() - 1)"
          [disabled]="page() === 0"
          class="px-3 py-1.5 rounded-full ring-1 ring-black/5 bg-white font-semibold text-stone-600 hover:ring-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Anterior
        </button>
        <span class="text-stone-500">
          Página {{ page() + 1 }} de {{ totalPages() }}
          @if (totalElements() > 0) {
            <span class="text-stone-400">· {{ totalElements() }} en total</span>
          }
        </span>
        <button
          type="button"
          (click)="go(page() + 1)"
          [disabled]="page() >= totalPages() - 1"
          class="px-3 py-1.5 rounded-full ring-1 ring-black/5 bg-white font-semibold text-stone-600 hover:ring-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente →
        </button>
      </div>
    }
  `,
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly totalElements = input<number>(0);
  readonly pageChange = output<number>();

  private readonly max = computed(() => this.totalPages() - 1);

  go(n: number): void {
    const clamped = Math.min(Math.max(0, n), this.max());
    if (clamped !== this.page()) this.pageChange.emit(clamped);
  }
}
