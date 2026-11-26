// Text starting with these characters could be run as a formula in Excel
const FORMULA_START = /^[=+\-@\t\r]/;

function escapeCell(value) {
  if (value === null || value === undefined) return '';
  let text = String(value);

  // Only text is guarded. Real numbers (like -3) are written as they are.
  if (typeof value === 'string' && FORMULA_START.test(text)) text = `'${text}`;

  if (/[",\r\n]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

// columns: [{ label: 'Product Code', csv: (row) => row.code }, ...]
export function buildCsv(columns, rows) {
  const header = columns.map((c) => escapeCell(c.label)).join(',');
  const lines = rows.map((row) => columns.map((c) => escapeCell(c.csv(row))).join(','));
  return [header, ...lines].join('\r\n');
}

export function downloadCsv(filename, csv) {
  // The BOM at the start helps Excel read the file as UTF-8
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}