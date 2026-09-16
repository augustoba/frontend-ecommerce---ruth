/**
 * Placeholder de logo realmente genérico — a diferencia de `LOGO_FALLBACK`
 * (`settings.service.ts`), que es el logo real de la tienda piloto usado
 * a propósito como su propio fallback (ver PLAN_SAAS.md #35), este es el
 * que se muestra en el asistente "Crear tienda" mientras todavía no se
 * subió ningún logo — no debe mostrar la marca de ninguna tienda existente.
 */
const GENERIC_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
  <circle cx="100" cy="100" r="100" fill="#e7e5e4"/>
  <text x="100" y="124" font-size="88" text-anchor="middle">🏬</text>
</svg>`;

export const GENERIC_LOGO_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(GENERIC_LOGO_SVG)}`;
