/**
 * Deriva las 8 paradas `--color-brand-50..700` a partir de un solo color de
 * marca elegido libremente (ver PLAN_SAAS.md Fase 10 y `SettingsService`).
 * Mismo criterio que las rampas escritas a mano en `styles.css`
 * (`ferreteria`/`repuestos`): tintes hacia blanco por encima de 500, sombras
 * hacia negro por debajo — el color que eligió el usuario queda intacto en
 * el 500 (el que más se usa: botones, precios, hero).
 */

export interface BrandRamp {
  '50': string;
  '100': string;
  '200': string;
  '300': string;
  '400': string;
  '500': string;
  '600': string;
  '700': string;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const BLACK: Rgb = { r: 0, g: 0, b: 0 };

const TINT_AMOUNTS: Record<'50' | '100' | '200' | '300' | '400', number> = {
  '50': 0.95,
  '100': 0.88,
  '200': 0.72,
  '300': 0.5,
  '400': 0.25,
};

const SHADE_AMOUNTS: Record<'600' | '700', number> = {
  '600': 0.18,
  '700': 0.34,
};

function hexToRgb(hex: string): Rgb | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(rgb: Rgb): string {
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
  return `#${c(rgb.r)}${c(rgb.g)}${c(rgb.b)}`;
}

function mix(base: Rgb, target: Rgb, amount: number): Rgb {
  return {
    r: base.r + (target.r - base.r) * amount,
    g: base.g + (target.g - base.g) * amount,
    b: base.b + (target.b - base.b) * amount,
  };
}

/** null si `baseHex` no es un hex válido (`#rrggbb`) — el caller no debe aplicar nada en ese caso. */
export function generateBrandRamp(baseHex: string): BrandRamp | null {
  const base = hexToRgb(baseHex);
  if (!base) return null;
  return {
    '50': rgbToHex(mix(base, WHITE, TINT_AMOUNTS['50'])),
    '100': rgbToHex(mix(base, WHITE, TINT_AMOUNTS['100'])),
    '200': rgbToHex(mix(base, WHITE, TINT_AMOUNTS['200'])),
    '300': rgbToHex(mix(base, WHITE, TINT_AMOUNTS['300'])),
    '400': rgbToHex(mix(base, WHITE, TINT_AMOUNTS['400'])),
    '500': rgbToHex(base),
    '600': rgbToHex(mix(base, BLACK, SHADE_AMOUNTS['600'])),
    '700': rgbToHex(mix(base, BLACK, SHADE_AMOUNTS['700'])),
  };
}
