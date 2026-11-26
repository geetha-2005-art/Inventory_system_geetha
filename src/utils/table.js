export function compareValues(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, {
    sensitivity: 'base',
    numeric: true,
  });
}

/** accessors lets a column sort by a different value, e.g. { stockStatus: (r) => rank } */
export function sortRows(rows, orderBy, order, accessors = {}) {
  const getValue = (row) => (accessors[orderBy] ? accessors[orderBy](row) : row[orderBy]);
  const sorted = [...rows].sort((a, b) => compareValues(getValue(a), getValue(b)));
  return order === 'desc' ? sorted.reverse() : sorted;
}

export function sortTransactionsNewestFirst(transactions) {
  return [...transactions].sort((a, b) => {
    const byDate = new Date(b.date) - new Date(a.date);
    if (byDate !== 0) return byDate;
    return String(b.id).localeCompare(String(a.id), undefined, { numeric: true });
  });
}