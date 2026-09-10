/**
 * "Remera rayada bebe" -> "remera-rayada-bebe". Saca tildes, pasa a minusculas y
 * deja solo letras/numeros separados por guiones. Vacio -> "producto".
 * Se usa para nombrar las fotos en Cloudinary (`<slug>-1`, `<slug>-2`, ...).
 */
export function slugify(text: string | null | undefined): string {
  const s = (text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // saca las tildes ya separadas por NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return s || 'producto';
}
