import { STOCK_STATUS } from './constants';

/**
 * Builds { productId: availableStock } in ONE pass over the transactions.
 * Available Stock = Opening + Stock In - Stock Out + Net Adjustments
 * (all four are stored as signed quantityChange values).
 */
export function buildStockMap(transactions) {
  const map = {};
  for (const t of transactions) {
    map[t.productId] = (map[t.productId] || 0) + t.quantityChange;
  }
  return map;
}

export function getStockStatus(availableStock, reorderLevel) {
  if (availableStock === 0) return STOCK_STATUS.OUT_OF_STOCK;
  if (availableStock <= reorderLevel) return STOCK_STATUS.LOW_STOCK;
  return STOCK_STATUS.IN_STOCK;
}

export function getInventoryValue(availableStock, unitCost) {
  return availableStock * unitCost;
}

export function getShortfall(availableStock, reorderLevel) {
  return Math.max(0, reorderLevel - availableStock);
}

// Adds category/supplier names and the calculated stock fields to each product
export function enrichProducts(products, stockMap, categories, suppliers) {
  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));
  const supplierById = Object.fromEntries(suppliers.map((s) => [s.id, s]));

  return products.map((p) => {
    const availableStock = stockMap[p.id] ?? 0;
    return {
      ...p,
      categoryName: categoryById[p.categoryId]?.name ?? 'Unknown',
      supplierName: supplierById[p.supplierId]?.name ?? 'Unknown',
      availableStock,
      stockStatus: getStockStatus(availableStock, p.reorderLevel),
      inventoryValue: getInventoryValue(availableStock, p.unitCost),
    };
  });
}