/**
 * Convierte un link de YouTube en la URL de embed sin cookies
 * (`youtube-nocookie.com/embed/<id>`). Acepta:
 *   https://www.youtube.com/watch?v=ID
 *   https://youtu.be/ID
 *   https://www.youtube.com/shorts/ID
 *   https://www.youtube.com/embed/ID
 * Devuelve null si el texto no parece un link de YouTube.
 */
export function youtubeEmbedUrl(raw: string | null | undefined): string | null {
  const id = youtubeId(raw);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
}

/** Extrae el id de 11 caracteres del video, o null. */
export function youtubeId(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const url = raw.trim();
  const patterns = [
    /youtube\.com\/watch\?(?:[^#]*&)?v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}
