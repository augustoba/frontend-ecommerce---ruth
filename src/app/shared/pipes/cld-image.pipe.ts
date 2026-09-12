import { Pipe, PipeTransform } from '@angular/core';

/**
 * Inserta transformaciones de entrega en una URL de Cloudinary para servir la
 * imagen liviana: `f_auto` (WebP/AVIF según el navegador), `q_auto` (calidad
 * automática) y, si se pasa un ancho, `w_<n>,c_limit` (nunca agranda el
 * original). Las URLs que no son de Cloudinary (data URI, `logo.jpeg`, URLs
 * externas pegadas a mano) se devuelven tal cual.
 *
 * Uso: `<img [src]="product.imageUrl | cldImg:400" />`
 */
@Pipe({ name: 'cldImg', standalone: true })
export class CldImagePipe implements PipeTransform {
  transform(url: string | null | undefined, width?: number): string {
    if (!url) return '';
    const marker = '/image/upload/';
    const at = url.indexOf(marker);
    if (at === -1 || !url.includes('.cloudinary.com/')) return url;

    const after = at + marker.length;
    const firstSeg = url.slice(after).split('/', 1)[0];
    // si ya trae transformaciones (ej: "f_auto,q_auto") no las duplicamos
    if (/(^|,)[a-z]{1,3}_[^/,]/.test(firstSeg) && !/^v\d+$/.test(firstSeg)) return url;

    const tx = ['f_auto', 'q_auto'];
    if (width && width > 0) tx.push(`w_${Math.round(width)}`, 'c_limit');
    return url.slice(0, after) + tx.join(',') + '/' + url.slice(after);
  }
}
