import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ShiftService } from '../../../core/services/shift.service';
import { CashRegister, CashRegisterService } from '../../../core/services/cash-register.service';
import { Shift } from '../../../core/models/shift.model';
import { ToastService } from '../../../core/services/toast.service';
import { CashRegisterTableComponent } from '../cash-register-table/cash-register-table.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

/**
 * Turnos: abrir/cerrar el propio, ver la caja de lo que uno cobró en ese
 * rango, e historial de turnos pasados (propios o de todos, si se puede
 * cerrar ajenos).
 */
@Component({
  selector: 'app-admin-shifts',
  imports: [DatePipe, CashRegisterTableComponent, PaginationComponent],
  templateUrl: './admin-shifts.component.html',
})
export class AdminShiftsComponent {
  private readonly shiftService = inject(ShiftService);
  private readonly cashRegisterService = inject(CashRegisterService);
  private readonly toast = inject(ToastService);

  readonly current = signal<Shift | null | undefined>(undefined);
  readonly currentCash = signal<CashRegister | null>(null);
  readonly opening = signal(false);
  readonly closing = signal(false);

  readonly history = this.shiftService.shifts;
  readonly historyLoading = this.shiftService.loading;
  readonly historyPage = this.shiftService.page;
  readonly historyTotalPages = this.shiftService.totalPages;
  readonly goToPage = (n: number) => this.shiftService.loadPage(n);

  readonly selectedShift = signal<Shift | null>(null);
  readonly selectedCash = signal<CashRegister | null>(null);

  constructor() {
    this.loadCurrent();
    this.shiftService.ensureLoaded();
  }

  private loadCurrent(): void {
    this.shiftService.current().subscribe({
      next: (shift) => {
        this.current.set(shift);
        if (shift) this.loadCurrentCash(shift.id);
      },
      error: () => this.current.set(null),
    });
  }

  private loadCurrentCash(shiftId: string): void {
    this.cashRegisterService.forShift(shiftId).subscribe({
      next: (r) => this.currentCash.set(r),
    });
  }

  openShift(): void {
    this.opening.set(true);
    this.shiftService.open().subscribe({
      next: (shift) => {
        this.opening.set(false);
        this.current.set(shift);
        this.currentCash.set(null);
        this.loadCurrentCash(shift.id);
      },
      error: () => this.opening.set(false),
    });
  }

  closeShift(): void {
    const shift = this.current();
    if (!shift) return;
    this.closing.set(true);
    this.shiftService.close(shift.id).subscribe({
      next: () => {
        this.closing.set(false);
        this.toast.success('Turno cerrado.');
        this.current.set(null);
        this.currentCash.set(null);
        this.shiftService.loadPage(0);
      },
      error: () => this.closing.set(false),
    });
  }

  viewShift(shift: Shift): void {
    this.selectedShift.set(shift);
    this.selectedCash.set(null);
    this.cashRegisterService.forShift(shift.id).subscribe({ next: (r) => this.selectedCash.set(r) });
  }

  closeDetail(): void {
    this.selectedShift.set(null);
    this.selectedCash.set(null);
  }

  print(): void {
    window.print();
  }
}
