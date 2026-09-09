import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CashRegister, CashRegisterService } from '../../../core/services/cash-register.service';

/** Cierre de caja del día: cuánto dinero debería haber por cada medio de pago. */
@Component({
  selector: 'app-admin-cash-register',
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './admin-cash-register.component.html',
})
export class AdminCashRegisterComponent {
  private readonly svc = inject(CashRegisterService);

  readonly date = signal(this.today());
  readonly data = signal<CashRegister | null>(null);
  readonly loading = signal(false);
  readonly error = signal(false);

  constructor() {
    this.load();
  }

  private today(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.svc.forDay(this.date()).subscribe({
      next: (r) => {
        this.data.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  print(): void {
    window.print();
  }
}
