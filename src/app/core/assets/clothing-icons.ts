/**
 * Fotos de ejemplo para productos y para el carrusel de bienvenida,
 * generadas como SVG en el momento (sin archivos externos ni conexión a
 * internet): un emoji grande de la prenda sobre un fondo de color pastel.
 * Cuando el dueño/a suba fotos reales, se cargan desde el form de producto
 * (galería `images[]`) o el panel de carrusel — sin tocar código.
 */

export type ClothingIcon = 'tshirt' | 'onesie' | 'hoodie' | 'dress' | 'pants' | 'skirt' | 'shoes';

const ICON_EMOJI: Record<ClothingIcon, string> = {
  tshirt: '👕',
  onesie: '🩱',
  hoodie: '🧥',
  dress: '👗',
  pants: '👖',
  skirt: '👗',
  shoes: '👟',
};

export interface IconTheme {
  /** Color de fondo del cuadrado */
  bg: string;
  /** Color del círculo detrás del emoji */
  fill: string;
}

/** Foto de ejemplo de un producto: emoji de la prenda sobre fondo pastel. */
export function clothingIconDataUri(icon: ClothingIcon, theme: IconTheme): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="${theme.bg}" />
    <circle cx="50" cy="47" r="33" fill="${theme.fill}" />
    <text x="50" y="53" font-size="42" text-anchor="middle" dominant-baseline="central">${ICON_EMOJI[icon]}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const HEART = (x: number, y: number, size: number, opacity: number) =>
  `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central" opacity="${opacity}">💗</text>`;

const DECO = (icon: ClothingIcon, x: number, y: number, size: number, rotate: number, opacity: number) =>
  `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central" opacity="${opacity}" transform="rotate(${rotate} ${x} ${y})">${ICON_EMOJI[icon]}</text>`;

/**
 * Banner ancho para el carrusel de bienvenida: fondo pastel con prendas y
 * corazones (el motivo del logo) dispersos de fondo.
 */
export function heroBannerDataUri(bg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 700">
    <rect width="1600" height="700" fill="${bg}" />
    ${DECO('tshirt', 230, 190, 150, -10, 0.55)}
    ${DECO('dress', 1340, 500, 170, 8, 0.55)}
    ${DECO('hoodie', 1180, 150, 120, 12, 0.5)}
    ${DECO('pants', 420, 530, 130, -8, 0.5)}
    ${DECO('shoes', 760, 600, 110, 6, 0.5)}
    ${HEART(120, 480, 60, 0.6)}
    ${HEART(1470, 210, 46, 0.6)}
    ${HEART(660, 100, 42, 0.55)}
    ${HEART(1020, 630, 54, 0.55)}
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
