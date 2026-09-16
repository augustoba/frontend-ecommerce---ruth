import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ConfigCard {
  path: string;
  icon: string;
  title: string;
  desc: string;
  where: string;
}

/** Portada de "Configuración del sitio": tarjetas hacia cada sección. */
@Component({
  selector: 'app-admin-config-hub',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './admin-config-hub.component.html',
})
export class AdminConfigHubComponent {
  readonly cards: ConfigCard[] = [
    {
      path: '/admin/config/apariencia',
      icon: '🎨',
      title: 'Apariencia',
      desc: 'Diseño de la tienda y color de marca.',
      where: 'Toda la tienda pública.',
    },
    {
      path: '/admin/config/identidad',
      icon: '🏬',
      title: 'Identidad y contacto',
      desc: 'Nombre de la tienda, logo y número de WhatsApp.',
      where: 'Encabezado, pie de página, favicon y el mensaje de pedido.',
    },
    {
      path: '/admin/config/whatsapp',
      icon: '💚',
      title: 'Mensaje de WhatsApp',
      desc: 'Los textos de saludo y cierre del mensaje de pedido.',
      where: 'El mensaje que se le abre al cliente al comprar.',
    },
    {
      path: '/admin/config/pagos',
      icon: '💳',
      title: 'Medios de pago',
      desc: 'Alias, QR de transferencia, QR/link de tarjeta y efectivo.',
      where: 'El cliente elige uno al comprar; queda en el pedido.',
    },
    {
      path: '/admin/config/mercadopago',
      icon: '🅿️',
      title: 'Mercado Pago',
      desc: 'Cobrá online: el pedido se confirma solo cuando el pago está aprobado.',
      where: 'Reemplaza al resto de los medios en el carrito online mientras esté activo.',
    },
    {
      path: '/admin/config/redes',
      icon: '📱',
      title: 'Redes sociales',
      desc: 'Usuario de Instagram y link de Facebook.',
      where: 'Links en el pie de página.',
    },
    {
      path: '/admin/config/nosotros',
      icon: '💬',
      title: 'Sobre nosotros',
      desc: 'El texto de presentación del local.',
      where: 'Pie de página.',
    },
    {
      path: '/admin/config/ayuda',
      icon: '❓',
      title: 'Cómo comprar + FAQ',
      desc: 'El paso a paso de la compra y las preguntas frecuentes.',
      where: 'Página /como-comprar (link en el pie de página).',
    },
    {
      path: '/admin/carrusel',
      icon: '🖼️',
      title: 'Carrusel',
      desc: 'Las fotos que pasan arriba de la home.',
      where: 'Arriba de todo en la página de inicio.',
    },
    {
      path: '/admin/config/servicios',
      icon: '✉️',
      title: 'Servicio de mail',
      desc: 'Credenciales SMTP para mandar los mails de campañas.',
      where: 'Lo usa la campaña automática de cupones (ver Campañas).',
    },
  ];
}
