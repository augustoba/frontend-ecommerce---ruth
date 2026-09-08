import { Injectable, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Order } from '../models/order.model';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private readonly currencyPipe = inject(CurrencyPipe);
  private readonly settingsService = inject(SettingsService);

  /**
   * Arma el link de WhatsApp (wa.me) con el pedido ya redactado en el mensaje,
   * para que el/la cliente solo tenga que apretar "Enviar". Así se evita
   * integrar una pasarela de pago: el dueño responde por WhatsApp con el
   * alias/link de Mercado Pago y coordinan el pago directamente.
   */
  buildOrderLink(order: Order): string {
    const message = this.buildOrderMessage(order);
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${this.settingsService.settings().whatsappNumber}?text=${encoded}`;
  }

  openOrderChat(order: Order): void {
    const url = this.buildOrderLink(order);
    window.open(url, '_blank', 'noopener');
  }

  private buildOrderMessage(order: Order): string {
    const lines = order.lines.map((line, index) => {
      const subtotal = this.formatCurrency(line.unitPrice * line.quantity);
      return `${index + 1}. ${line.productName} — Talle ${line.size} x${line.quantity} = ${subtotal}`;
    });

    const nameLine =
      order.customerName && order.customerName !== 'Sin nombre' ? `🙋 Nombre: ${order.customerName}\n\n` : '';

    const totalsLines =
      order.discountAmount > 0
        ? [
            `Subtotal: ${this.formatCurrency(order.subtotal)}`,
            `🎉 Descuento (${order.discountPercent}%): -${this.formatCurrency(order.discountAmount)}`,
            `💰 Total: ${this.formatCurrency(order.total)}`,
          ]
        : [`💰 Total: ${this.formatCurrency(order.total)}`];

    return [
      `¡Hola! Quiero hacer un pedido en *${this.settingsService.settings().storeName}* 🧸`,
      `Código de pedido: *${order.code}*`,
      '',
      nameLine.trimEnd(),
      '🛒 Pedido:',
      ...lines,
      '',
      ...totalsLines,
      '',
      'Quedo atento/a a que me pases el alias o el link de Mercado Pago para coordinar el pago. ¡Gracias!',
    ]
      .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
      .join('\n');
  }

  private formatCurrency(value: number): string {
    return this.currencyPipe.transform(value, 'ARS', 'symbol', '1.0-0') ?? `$${value}`;
  }
}
