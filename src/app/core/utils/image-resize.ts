/**
 * Redimensiona (y opcionalmente recorta) una imagen elegida por el usuario
 * (input type="file") y la devuelve como data URL, lista para subir.
 *
 * Por defecto exporta JPEG. Para un logo con transparencia pasá
 * `type: 'image/png'` (más pesado, pero conserva el fondo transparente).
 * Si pasás `aspectRatio` (ancho/alto, ej: 21/9), primero recorta la imagen
 * centrada a esa proporción y después la escala.
 */

/** Formatos de imagen que aceptamos para subir. */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

/**
 * Valida un archivo elegido antes de procesarlo. Devuelve un mensaje de error
 * para mostrar, o null si el archivo sirve.
 */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'El archivo tiene que ser una imagen JPG, PNG o WebP.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'La imagen es muy pesada (máximo 15 MB). Probá con una más liviana.';
  }
  return null;
}

export function resizeImageFile(
  file: File,
  maxWidth = 1600,
  quality = 0.82,
  type: 'image/jpeg' | 'image/png' = 'image/jpeg',
  aspectRatio?: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const invalid = validateImageFile(file);
    if (invalid) {
      reject(new Error(invalid));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('El archivo no es una imagen válida'));
      img.onload = () => {
        // Recorte centrado a la proporción pedida (si se pidió una).
        let sx = 0;
        let sy = 0;
        let sw = img.width;
        let sh = img.height;
        if (aspectRatio && aspectRatio > 0) {
          const srcRatio = img.width / img.height;
          if (srcRatio > aspectRatio) {
            sw = Math.round(img.height * aspectRatio);
            sx = Math.round((img.width - sw) / 2);
          } else {
            sh = Math.round(img.width / aspectRatio);
            sy = Math.round((img.height - sh) / 2);
          }
        }

        const scale = Math.min(1, maxWidth / sw);
        const width = Math.round(sw * scale);
        const height = Math.round(sh * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo procesar la imagen'));
          return;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
        resolve(canvas.toDataURL(type, quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
