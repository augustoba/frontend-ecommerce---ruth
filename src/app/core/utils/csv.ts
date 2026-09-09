/** Escapa un valor para CSV (comillas dobles si tiene coma, comilla o salto de línea). */
function cell(value: unknown): string {
  const s = value == null ? '' : String(value);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Arma el texto CSV a partir de filas (la primera suele ser el encabezado). */
export function toCsv(rows: unknown[][]): string {
  return rows.map((r) => r.map(cell).join(',')).join('\r\n');
}

/** Dispara la descarga de un archivo de texto en el navegador. */
export function downloadText(filename: string, text: string, mime = 'text/csv;charset=utf-8'): void {
  // BOM para que Excel abra bien los acentos.
  const blob = new Blob(['﻿' + text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Atajo: arma el CSV y lo descarga. */
export function downloadCsv(filename: string, rows: unknown[][]): void {
  downloadText(filename, toCsv(rows));
}
