const currencyFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const numberFormat = new Intl.NumberFormat('en-IN');

export const formatCurrency = (value) => currencyFormat.format(value);
export const formatNumber = (value) => numberFormat.format(value);

export function formatDateTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}