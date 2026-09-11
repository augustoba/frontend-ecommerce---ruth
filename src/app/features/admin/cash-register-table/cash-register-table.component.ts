import { Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CashRegister } from '../../../core/services/cash-register.service';

/** Tabla de cierre de caja (medio de pago x local/cambios/online/total). Reusada por Caja y Turnos. */
@Component({
  selector: 'app-cash-register-table',
  imports: [CurrencyPipe],
  templateUrl: './cash-register-table.component.html',
})
export class CashRegisterTableComponent {
  @Input() data: CashRegister | null = null;
}
