import { Component, input } from '@angular/core';

/**
 * Placeholders con animate-pulse mientras carga algo del backend.
 *  <app-skeleton variant="card" [count]="8" />   grilla de tarjetas de producto
 *  <app-skeleton variant="row" [count]="6" />     filas de tabla
 *  <app-skeleton variant="block" class="h-40" />  bloque genérico
 */
@Component({
  selector: 'app-skeleton',
  template: `
    @switch (variant()) {
      @case ('card') {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          @for (i of range(); track i) {
            <div class="bg-white rounded-2xl ring-1 ring-black/5 overflow-hidden animate-pulse">
              <div class="aspect-[4/5] bg-stone-200"></div>
              <div class="p-4 space-y-2">
                <div class="h-4 bg-stone-200 rounded w-3/4"></div>
                <div class="h-3 bg-stone-200 rounded w-1/2"></div>
                <div class="h-5 bg-stone-200 rounded w-1/3 mt-2"></div>
              </div>
            </div>
          }
        </div>
      }
      @case ('row') {
        <div class="bg-white rounded-2xl ring-1 ring-black/5 divide-y divide-stone-100">
          @for (i of range(); track i) {
            <div class="p-4 flex items-center gap-3 animate-pulse">
              <div class="w-11 h-11 rounded-lg bg-stone-200 shrink-0"></div>
              <div class="h-4 bg-stone-200 rounded flex-1 max-w-xs"></div>
              <div class="h-4 bg-stone-200 rounded w-16"></div>
            </div>
          }
        </div>
      }
      @default {
        <div class="bg-stone-200 rounded-xl animate-pulse w-full h-full"></div>
      }
    }
  `,
})
export class SkeletonComponent {
  readonly variant = input<'card' | 'row' | 'block'>('block');
  readonly count = input<number>(6);

  range(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i);
  }
}
