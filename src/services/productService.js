import { STATUS, STORAGE_KEYS, TRANSACTION_TYPES } from '../utils/constants';
import { generateId, nextTransactionId } from '../utils/id';
import { hasErrors, validateProduct } from '../utils/validators';
import { buildStockMap, enrichProducts } from '../utils/stock';
import { sortTransactionsNewestFirst } from '../utils/table';
import { readCollection } from './storage';
import { loadForUpdate, saveItems } from './repository';

const isUnreadable = (result) => result.status === 'corrupted' || result.status === 'error';

// Reads everything a product screen needs. If any part is unreadable we stop.
function loadAll() {
  const products = readCollection(STORAGE_KEYS.PRODUCTS);
  const transactions = readCollection(STORAGE_KEYS.TRANSACTIONS);
  const categories = readCollection(STORAGE_KEYS.CATEGORIES);
  const suppliers = readCollection(STORAGE_KEYS.SUPPLIERS);

  if ([products, transactions, categories, suppliers].some(isUnreadable)) return { ok: false };

  return {
    ok: true,
    products: products.data,
    transactions: transactions.data,
    categories: categories.data,
    suppliers: suppliers.data,
  };
}

export function getProductList() {
  const data = loadAll();
  if (!data.ok) return { unreadable: true, rows: [], categories: [], suppliers: [] };

  const stockMap = buildStockMap(data.transactions);
  return {
    unreadable: false,
    rows: enrichProducts(data.products, stockMap, data.categories, data.suppliers),
    categories: data.categories,
    suppliers: data.suppliers,
  };
}

// status: 'ok' | 'unreadable' | 'notfound'
export function getProductDetails(id) {
  const data = loadAll();
  if (!data.ok) return { status: 'unreadable' };

  const stockMap = buildStockMap(data.transactions);
  const rows = enrichProducts(data.products, stockMap, data.categories, data.suppliers);
  const product = rows.find((r) => r.id === id);
  if (!product) return { status: 'notfound' };

  const own = data.transactions.filter((t) => t.productId === id);
  return {
    status: 'ok',
    product,
    latestTransactions: sortTransactionsNewestFirst(own).slice(0, 10),
    totalTransactions: own.length,
  };
}

// For the Add/Edit form. id = undefined means Add mode.
export function getProductFormData(id) {
  const data = loadAll();
  if (!data.ok) return { status: 'unreadable' };

  const base = {
    status: 'ok',
    categories: data.categories,
    suppliers: data.suppliers,
    product: null,
    openingStock: 0,
  };
  if (!id) return base;

  const product = data.products.find((p) => p.id === id);
  if (!product) return { status: 'notfound' };

  const opening = data.transactions.find(
    (t) => t.productId === id && t.type === TRANSACTION_TYPES.OPENING
  );
  return { ...base, product, openingStock: opening ? opening.quantityChange : 0 };
}

export function addProduct(values) {
  const products = loadForUpdate(STORAGE_KEYS.PRODUCTS);
  if (!products.ok) return products;
  const transactions = loadForUpdate(STORAGE_KEYS.TRANSACTIONS);
  if (!transactions.ok) return transactions;

  const categories = readCollection(STORAGE_KEYS.CATEGORIES);
  const suppliers = readCollection(STORAGE_KEYS.SUPPLIERS);
  if (isUnreadable(categories) || isUnreadable(suppliers)) {
    return {
      ok: false,
      message: 'Category or supplier data could not be read, so the product was not saved.',
    };
  }

  const errors = validateProduct(values, {
    products: products.items,
    categories: categories.data,
    suppliers: suppliers.data,
  });
  if (hasErrors(errors)) return { ok: false, errors };

  const product = {
    id: generateId('prod'),
    code: values.code.trim(),
    name: values.name.trim(),
    categoryId: values.categoryId,
    supplierId: values.supplierId,
    description: (values.description ?? '').trim(),
    unit: values.unit,
    unitCost: Number(values.unitCost),
    reorderLevel: Number(values.reorderLevel),
    status: values.status,
  };

  // Opening stock is recorded as the first transaction (BR-009)
  const openingStock = Number(values.openingStock);
  let nextTransactions = transactions.items;
  if (openingStock > 0) {
    nextTransactions = [
      ...transactions.items,
      {
        id: nextTransactionId(transactions.items),
        date: new Date().toISOString(),
        productId: product.id,
        type: TRANSACTION_TYPES.OPENING,
        quantityChange: openingStock,
        balanceAfter: openingStock,
        reference: '',
        remarks: 'Opening stock',
      },
    ];
  }

  const savedProducts = saveItems(STORAGE_KEYS.PRODUCTS, [...products.items, product]);
  if (!savedProducts.ok) return savedProducts;

  if (nextTransactions !== transactions.items) {
    const savedTransactions = saveItems(STORAGE_KEYS.TRANSACTIONS, nextTransactions);
    if (!savedTransactions.ok) {
      saveItems(STORAGE_KEYS.PRODUCTS, products.items); // roll back: no half-saved data
      return savedTransactions;
    }
  }
  return { ok: true, product };
}

export function updateProduct(id, values) {
  const products = loadForUpdate(STORAGE_KEYS.PRODUCTS);
  if (!products.ok) return products;

  const index = products.items.findIndex((p) => p.id === id);
  if (index === -1) return { ok: false, message: 'Product not found. It may have been removed.' };
  const existing = products.items[index];

  const categories = readCollection(STORAGE_KEYS.CATEGORIES);
  const suppliers = readCollection(STORAGE_KEYS.SUPPLIERS);
  if (isUnreadable(categories) || isUnreadable(suppliers)) {
    return {
      ok: false,
      message: 'Category or supplier data could not be read, so the product was not saved.',
    };
  }

  // Code is locked, and opening stock is never part of the product record
  const input = { ...values, code: existing.code };
  const errors = validateProduct(
    input,
    { products: products.items, categories: categories.data, suppliers: suppliers.data },
    existing
  );
  if (hasErrors(errors)) return { ok: false, errors };

  const items = [...products.items];
  items[index] = {
    ...existing,
    name: input.name.trim(),
    categoryId: input.categoryId,
    supplierId: input.supplierId,
    description: (input.description ?? '').trim(),
    unit: input.unit,
    unitCost: Number(input.unitCost),
    reorderLevel: Number(input.reorderLevel),
    status: input.status,
  };
  return saveItems(STORAGE_KEYS.PRODUCTS, items);
}

export function setProductStatus(id, status) {
  const products = loadForUpdate(STORAGE_KEYS.PRODUCTS);
  if (!products.ok) return products;

  const index = products.items.findIndex((p) => p.id === id);
  if (index === -1) return { ok: false, message: 'Product not found. It may have been removed.' };

  if (status === STATUS.ACTIVE) {
    const categories = readCollection(STORAGE_KEYS.CATEGORIES);
    if (isUnreadable(categories)) {
      return { ok: false, message: 'Category data could not be read, so the product was not changed.' };
    }
    const category = categories.data.find((c) => c.id === products.items[index].categoryId);
    if (!category || category.status !== STATUS.ACTIVE) {
      return {
        ok: false,
        message: 'Cannot activate: the product\'s category is inactive. Activate the category first.',
      };
    }
  }

  const items = [...products.items];
  items[index] = { ...items[index], status };
  return saveItems(STORAGE_KEYS.PRODUCTS, items);
}