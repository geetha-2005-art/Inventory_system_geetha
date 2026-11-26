export function generateId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// Next sequential transaction id, e.g. TXN-0051
export function nextTransactionId(transactions) {
  let max = 0;
  for (const t of transactions) {
    const n = parseInt(String(t.id).replace('TXN-', ''), 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return `TXN-${String(max + 1).padStart(4, '0')}`;
}