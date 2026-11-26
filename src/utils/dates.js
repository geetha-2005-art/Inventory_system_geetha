// Converts an ISO timestamp to a local calendar day like "2026-11-24".
// Date-only strings compare correctly with simple < and > checks.
export function toLocalDateKey(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayKey() {
  return toLocalDateKey(new Date().toISOString());
}