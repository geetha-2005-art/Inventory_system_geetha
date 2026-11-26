import { STORAGE_KEYS } from '../utils/constants';
import { buildStockMap, enrichProducts } from '../utils/stock';
import { readCollection } from './storage';

const isUnreadable = (result) => result.status === 'corrupted' || result.status === 'error';

// Read-only. Everything the three reports need, calculated fresh from saved data.
export function getReportData() {
  const products = readCollection(STORAGE_KEYS.PRODUCTS);
  const transactions = readCollection(STORAGE_KEYS.TRANSACTIONS);
  const categories = readCollection(STORAGE_KEYS.CATEGORIES);
  const suppliers = readCollection(STORAGE_KEYS.SUPPLIERS);

  if ([products, transactions, categories, suppliers].some(isUnreadable)) {
    return { unreadable: true };
  }

  const stockMap = buildStockMap(transactions.data);
  const enriched = enrichProducts(products.data, stockMap, categories.data, suppliers.data);
  const productById = Object.fromEntries(enriched.map((p) => [p.id, p]));

  const movements = transactions.data
    .map((t) => {
      const product = productById[t.productId];
      return {
        ...t,
        productCode: product ? product.code : '-',
        productName: product ? product.name : 'Unknown product',
      };
    })
    // Oldest id first, so same-timestamp rows keep a stable order when sorted
    .sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));

  return {
    unreadable: false,
    products: enriched.sort((a, b) => a.code.localeCompare(b.code)),
    categories: [...categories.data].sort((a, b) => a.name.localeCompare(b.name)),
    movements,
  };
}