import { STATUS, STORAGE_KEYS, STOCK_STATUS, TRANSACTION_TYPES } from '../utils/constants';
import { toLocalDateKey, todayKey } from '../utils/dates';
import { buildStockMap, enrichProducts, getShortfall } from '../utils/stock';
import { readCollection } from './storage';

const isUnreadable = (result) => result.status === 'corrupted' || result.status === 'error';

// Read-only. Everything is calculated fresh from the saved data.
export function getDashboardData() {
  const products = readCollection(STORAGE_KEYS.PRODUCTS);
  const transactions = readCollection(STORAGE_KEYS.TRANSACTIONS);
  const categories = readCollection(STORAGE_KEYS.CATEGORIES);
  const suppliers = readCollection(STORAGE_KEYS.SUPPLIERS);

  if ([products, transactions, categories, suppliers].some(isUnreadable)) {
    return { unreadable: true };
  }

  const stockMap = buildStockMap(transactions.data);
  const enriched = enrichProducts(products.data, stockMap, categories.data, suppliers.data);

  // Inactive products are excluded from active inventory figures and alerts
  const active = enriched.filter((p) => p.status === STATUS.ACTIVE);

  const lowStock = active.filter((p) => p.stockStatus === STOCK_STATUS.LOW_STOCK);
  const outOfStock = active.filter((p) => p.stockStatus === STOCK_STATUS.OUT_OF_STOCK);

  // Today's activity (opening balances are not daily activity, so they are not counted)
  const today = todayKey();
  const todays = transactions.data.filter((t) => toLocalDateKey(t.date) === today);
  const countType = (type) => todays.filter((t) => t.type === type).length;
  const receipts = countType(TRANSACTION_TYPES.STOCK_IN);
  const issues = countType(TRANSACTION_TYPES.STOCK_OUT);
  const adjustments = countType(TRANSACTION_TYPES.ADJUSTMENT);

  // Total stock units for each category (active products only)
  const unitsByCategory = {};
  for (const p of active) {
    unitsByCategory[p.categoryId] = (unitsByCategory[p.categoryId] || 0) + p.availableStock;
  }
  const categoryStock = categories.data
    .filter((c) => active.some((p) => p.categoryId === c.id))
    .map((c) => ({ name: c.name, units: unitsByCategory[c.id] || 0 }))
    .sort((a, b) => b.units - a.units);

  // Products to reorder: Out of Stock first, then the biggest shortfall
  const replenishment = [...outOfStock, ...lowStock]
    .map((p) => ({ ...p, shortfall: getShortfall(p.availableStock, p.reorderLevel) }))
    .sort((a, b) => {
      const aOut = a.stockStatus === STOCK_STATUS.OUT_OF_STOCK ? 0 : 1;
      const bOut = b.stockStatus === STOCK_STATUS.OUT_OF_STOCK ? 0 : 1;
      if (aOut !== bOut) return aOut - bOut;
      if (b.shortfall !== a.shortfall) return b.shortfall - a.shortfall;
      return a.code.localeCompare(b.code);
    });

  return {
    unreadable: false,
    totalProducts: active.length,
    totalUnits: active.reduce((sum, p) => sum + p.availableStock, 0),
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock.length,
    inventoryValue: active.reduce((sum, p) => sum + p.inventoryValue, 0),
    todayTotal: receipts + issues + adjustments,
    receipts,
    issues,
    adjustments,
    categoryStock,
    replenishment,
  };
}