import { STORAGE_KEYS } from '../utils/constants';
import { readCollection } from './storage';

const isUnreadable = (result) => result.status === 'corrupted' || result.status === 'error';

// Read-only. Returns every transaction with its product's code and name attached.
export function getTransactionHistory() {
  const products = readCollection(STORAGE_KEYS.PRODUCTS);
  const transactions = readCollection(STORAGE_KEYS.TRANSACTIONS);

  if (isUnreadable(products) || isUnreadable(transactions)) {
    return { unreadable: true, rows: [], products: [] };
  }

  const productById = Object.fromEntries(products.data.map((p) => [p.id, p]));

  const rows = transactions.data
    .map((t) => {
      const product = productById[t.productId];
      return {
        ...t,
        productCode: product ? product.code : '-',
        productName: product ? product.name : 'Unknown product',
        productLabel: product ? `${product.code} - ${product.name}` : 'Unknown product',
      };
    })
    // Oldest id first: later, a stable sort keeps same-timestamp rows in id order
    .sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));

  return {
    unreadable: false,
    rows,
    products: [...products.data].sort((a, b) => a.code.localeCompare(b.code)),
  };
}