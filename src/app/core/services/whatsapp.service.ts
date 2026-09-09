import { Injectable, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Order } from '../models/order.model';
import {
  SettingsService,
  SiteSettings,
  WHATSAPP_INTRO_DEFAULT,
  WHATSAPP_CLOSING_DEFAULT,
} from './settings.service';

/** Reemplaza los tokens {tienda} y {codigo} en los textos configurables del mensaje. */
export function applyWhatsappTokens(text: string, storeName: string, code: string): string {
  return text.replace(/\{tienda\}/g, storeName).replace(/\{codigo\}/g, code);
}

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

  /**
   * Texto plano del resumen del pedido (el mismo que va al mensaje de WhatsApp).
   * Lo usa el panel para "copiar resumen" / reenviarlo a mano.
   */
  buildOrderMessage(order: Order): string {
    const settings = this.settingsService.settings();
    const lines = order.lines.map((line, index) => {
      const subtotal = this.formatCurrency(line.unitPrice * line.quantity);
      return `${index + 1}. ${line.productName} — Talle ${line.size} x${line.quantity} = ${subtotal}`;
    });

    const nameLine =
      order.customerName && order.customerName !== 'Sin nombre' ? `🙋 Nombre: ${order.customerName}\n\n` : '';

    const couponAmount = order.couponDiscount ?? 0;
    const hasAnyDiscount = order.discountAmount > 0 || couponAmount > 0;
    const totalsLines = hasAnyDiscount
      ? [
          `Subtotal: ${this.formatCurrency(order.subtotal)}`,
          ...(order.discountAmount > 0
            ? [`🎉 Descuento (${order.discountPercent}%): -${this.formatCurrency(order.discountAmount)}`]
            : []),
          ...(order.discountNote ? [`   (${order.discountNote})`] : []),
          ...(couponAmount > 0
            ? [`🎟️ Cupón ${order.couponCode ?? ''}: -${this.formatCurrency(couponAmount)}`]
            : []),
          `💰 Total: ${this.formatCurrency(order.total)}`,
        ]
      : [`💰 Total: ${this.formatCurrency(order.total)}`];

    const deliveryLines = this.deliveryLines(order, settings);
    const paymentLines = this.paymentLines(order, settings);

    const intro = applyWhatsappTokens(
      settings.whatsappIntro?.trim() || WHATSAPP_INTRO_DEFAULT,
      settings.storeName,
      order.code
    );
    const closing = applyWhatsappTokens(
      settings.whatsappClosing?.trim() || WHATSAPP_CLOSING_DEFAULT,
      settings.storeName,
      order.code
    );

    return [
      intro,
      `Código de pedido: *${order.code}*`,
      '',
      nameLine.trimEnd(),
      '🛒 Pedido:',
      ...lines,
      '',
      ...totalsLines,
      '',
      ...deliveryLines,
      ...paymentLines,
      '',
      closing,
    ]
      .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
      .join('\n');
  }

  private deliveryLines(order: Order, settings: SiteSettings): string[] {
    if (order.deliveryMethod === 'SHIPPING') {
      const out = [`📦 Entrega: Envío a domicilio`];
      if (order.shippingAddress) out.push(`   📍 ${order.shippingAddress}`);
      if (order.shippingReference) out.push(`   📝 ${order.shippingReference}`);
      if (order.shippingLat != null && order.shippingLng != null) {
        out.push(`   🗺️ https://www.google.com/maps?q=${order.shippingLat},${order.shippingLng}`);
      }
      out.push(order.freeShippingNote ? `   🚚 ${order.freeShippingNote}` : '   (el costo del envío lo coordinamos)');
      return out;
    }
    const where = settings.storeAddress?.trim();
    return [`🏬 Entrega: Retiro en el local${where ? ` (${where})` : ''}`];
  }

  private paymentLines(order: Order, settings: SiteSettings): string[] {
    switch (order.paymentMethod) {
      case 'TRANSFER': {
        const alias = settings.paymentTransferAlias?.trim();
        return alias
          ? [`💳 Pago: Transferencia — alias/CBU: *${alias}*`]
          : ['💳 Pago: Transferencia'];
      }
      case 'QR_TRANSFER':
        return ['💳 Pago: QR de transferencia (te paso el QR)'];
      case 'QR_CARD': {
        const link = settings.paymentCardLink?.trim();
        return link
          ? [`💳 Pago: Tarjeta — link de pago: ${link}`]
          : ['💳 Pago: Tarjeta (te paso el QR de pago)'];
      }
      case 'CASH':
        return ['💳 Pago: Efectivo al recibir/retirar'];
      default:
        return [];
    }
  }

  private formatCurrency(value: number): string {
    return this.currencyPipe.transform(value, 'ARS', 'symbol', '1.0-0') ?? `$${value}`;
  }
}
