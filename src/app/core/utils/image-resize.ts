/**
 * Redimensiona una imagen elegida por el usuario (input type="file") y la
 * devuelve como data URL. Así se puede guardar la foto directamente sin un
 * servidor de archivos, y sin que una foto de 10-20MB de un celular pese de más.
 *
 * Por defecto exporta JPEG. Para un logo con transparencia pasá
 * `type: 'image/png'` (más pesado, pero conserva el fondo transparente).
 */
export function resizeImageFile(
  file: File,
  maxWidth = 1600,
  quality = 0.82,
  type: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('El archivo no es una imagen válida'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo procesar la imagen'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(type, quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
