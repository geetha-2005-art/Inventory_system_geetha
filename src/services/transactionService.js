import { STATUS, STORAGE_KEYS, TRANSACTION_TYPES } from '../utils/constants';
import { nextTransactionId } from '../utils/id';
import { buildStockMap } from '../utils/stock';
import { hasErrors } from '../utils/validators';
import {
  validateAdjustment,
  validateStockIn,
  validateStockOut,
} from '../utils/transactionValidators';
import { readCollection } from './storage';
import { loadForUpdate, saveItems } from './repository';

const isUnreadable = (result) => result.status === 'corrupted' || result.status === 'error';

// For the three stock forms: active products (with live stock) and active suppliers
export function getTransactionFormData() {
  const products = readCollection(STORAGE_KEYS.PRODUCTS);
  const suppliers = readCollection(STORAGE_KEYS.SUPPLIERS);
  const transactions = readCollection(STORAGE_KEYS.TRANSACTIONS);

  if ([products, suppliers, transactions].some(isUnreadable)) return { status: 'unreadable' };

  const stockMap = buildStockMap(transactions.data);
  return {
    status: 'ok',
    products: products.data
      .filter((p) => p.status === STATUS.ACTIVE)
      .map((p) => ({ ...p, availableStock: stockMap[p.id] ?? 0 }))
      .sort((a, b) => a.code.localeCompare(b.code)),
    suppliers: suppliers.data
      .filter((s) => s.status === STATUS.ACTIVE)
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

// Reads everything fresh. Stops if any saved data is unreadable.
function loadContext() {
  const transactions = loadForUpdate(STORAGE_KEYS.TRANSACTIONS);
  if (!transactions.ok) return transactions;

  const products = readCollection(STORAGE_KEYS.PRODUCTS);
  const suppliers = readCollection(STORAGE_KEYS.SUPPLIERS);
  if (isUnreadable(products) || isUnreadable(suppliers)) {
    return {
      ok: false,
      message: 'Product or supplier data could not be read, so nothing was saved.',
    };
  }

  return {
    ok: true,
    transactions: transactions.items,
    products: products.data,
    suppliers: suppliers.data,
    stockMap: buildStockMap(transactions.items),
  };
}

// The ONLY place a transaction is created. Stock can never go negative here (BR-008).
function appendTransaction(transactions, productId, availableStock, details) {
  const balanceAfter = availableStock + details.quantityChange;
  if (balanceAfter < 0) {
    return {
      ok: false,
      message: 'This transaction would make stock negative, so it was not saved.',
    };
  }

  const transaction = {
    id: nextTransactionId(transactions),
    date: new Date().toISOString(),
    productId,
    balanceAfter,
    ...details,
  };

  const saved = saveItems(STORAGE_KEYS.TRANSACTIONS, [...transactions, transaction]);
  return saved.ok ? { ok: true, transaction } : saved;
}

export function recordStockIn(values) {
  const ctx = loadContext();
  if (!ctx.ok) return ctx;

  const product = ctx.products.find((p) => p.id === values.productId);
  const supplier = ctx.suppliers.find((s) => s.id === values.supplierId);

  const errors = validateStockIn(values, { product, supplier });
  if (hasErrors(errors)) return { ok: false, errors };

  const result = appendTransaction(ctx.transactions, product.id, ctx.stockMap[product.id] ?? 0, {
    type: TRANSACTION_TYPES.STOCK_IN,
    quantityChange: Number(values.quantity),
    supplierId: supplier.id,
    unitCost: Number(values.unitCost), // kept on the transaction only; master cost is unchanged
    reference: (values.reference ?? '').trim(),
    remarks: (values.remarks ?? '').trim(),
  });
  return result.ok ? { ...result, product } : result;
}

export function recordStockOut(values) {
  const ctx = loadContext();
  if (!ctx.ok) return ctx;

  const product = ctx.products.find((p) => p.id === values.productId);
  const availableStock = product ? ctx.stockMap[product.id] ?? 0 : 0;

  const errors = validateStockOut(values, { product, availableStock });
  if (hasErrors(errors)) return { ok: false, errors };

  const issuedTo = values.issuedTo.trim();
  const department = values.department.trim();
  const purpose = values.purpose.trim();

  const result = appendTransaction(ctx.transactions, product.id, availableStock, {
    type: TRANSACTION_TYPES.STOCK_OUT,
    quantityChange: -Number(values.quantity),
    issuedTo,
    department,
    purpose,
    reference: '',
    remarks: `Issued to ${issuedTo} (${department}). Purpose: ${purpose}`,
  });
  return result.ok ? { ...result, product } : result;
}

export function recordAdjustment(values) {
  const ctx = loadContext();
  if (!ctx.ok) return ctx;

  const product = ctx.products.find((p) => p.id === values.productId);
  const availableStock = product ? ctx.stockMap[product.id] ?? 0 : 0;

  const errors = validateAdjustment(values, { product, availableStock });
  if (hasErrors(errors)) return { ok: false, errors };

  const reason = values.reason.trim();

  const result = appendTransaction(ctx.transactions, product.id, availableStock, {
    type: TRANSACTION_TYPES.ADJUSTMENT,
    quantityChange: Number(values.actualStock) - availableStock, // the calculated difference
    reason,
    reference: '',
    remarks: reason,
  });
  return result.ok ? { ...result, product } : result;
}