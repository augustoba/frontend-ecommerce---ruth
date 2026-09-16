/**
 * Extrae el color más característico de una imagen de logo (dominante, no
 * gris/blanco/negro) usando un `<canvas>` — todo en el navegador, no pega al
 * backend. Se usa para sugerir un color de marca acorde al logo que suba el
 * negocio (el usuario siempre puede después ajustarlo a mano).
 */
export function extractLogoColor(imageUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const size = 48;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);

        const { data } = ctx.getImageData(0, 0, size, size);
        const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 128) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const lightness = (max + min) / 2;
          const saturation = max === min ? 0 : (max - min) / (255 - Math.abs(2 * lightness - 255));
          // Descarta fondo blanco/negro/gris del logo: nos interesa el color, no el lienzo.
          if (lightness > 235 || lightness < 20 || saturation < 0.15) continue;

          // Bucketiza a pasos de 24 para agrupar variaciones de un mismo color (anti-aliasing, JPG).
          const key = `${Math.round(r / 24)}_${Math.round(g / 24)}_${Math.round(b / 24)}`;
          const bucket = buckets.get(key);
          if (bucket) {
            bucket.count++;
            bucket.r += r;
            bucket.g += g;
            bucket.b += b;
          } else {
            buckets.set(key, { count: 1, r, g, b });
          }
        }

        if (buckets.size === 0) return resolve(null);

        let best: { count: number; r: number; g: number; b: number } | null = null;
        for (const bucket of buckets.values()) {
          if (!best || bucket.count > best.count) best = bucket;
        }
        if (!best) return resolve(null);

        const r = Math.round(best.r / best.count);
        const g = Math.round(best.g / best.count);
        const b = Math.round(best.b / best.count);
        const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
        resolve(hex);
      } catch {
        // Canvas "tainted" (la imagen no habilita CORS) u otro error — sin sugerencia.
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}
