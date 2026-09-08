import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-quantity-stepper',
  templateUrl: './quantity-stepper.component.html',
  styleUrl: './quantity-stepper.component.css',
})
export class QuantityStepperComponent {
  readonly quantity = input.required<number>();
  readonly min = input(1);
  readonly max = input(99);

  readonly quantityChange = output<number>();

  decrement(): void {
    const next = this.quantity() - 1;
    if (next >= this.min()) this.quantityChange.emit(next);
  }

  increment(): void {
    const next = this.quantity() + 1;
    if (next <= this.max()) this.quantityChange.emit(next);
  }
}
