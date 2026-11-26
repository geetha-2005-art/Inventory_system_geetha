import { STATUS } from './constants';

const INTEGER_PATTERN = /^\d+$/;
const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;
const MAX_QUANTITY = 1000000;

function checkProduct(product) {
  if (!product) return 'Select a product.';
  if (product.status !== STATUS.ACTIVE) {
    return 'Inactive products cannot be used in new stock transactions.';
  }
  return null;
}

// Whole number greater than zero
function checkQuantity(value, label) {
  const text = String(value ?? '').trim();
  if (text === '') return `${label} is required.`;
  if (!INTEGER_PATTERN.test(text)) return `${label} must be a whole number greater than zero.`;
  if (Number(text) === 0) return `${label} must be greater than zero.`;
  if (Number(text) > MAX_QUANTITY) return `${label} must not exceed 1,000,000.`;
  return null;
}

function checkRequiredText(value, label, max) {
  const text = String(value ?? '').trim();
  if (!text) return `${label} is required.`;
  if (text.length > max) return `${label} must be ${max} characters or fewer.`;
  return null;
}

export function validateStockIn(values, { product, supplier }) {
  const errors = {};

  const productError = checkProduct(product);
  if (productError) errors.productId = productError;

  if (!values.supplierId) errors.supplierId = 'Select a supplier.';
  else if (!supplier) errors.supplierId = 'The selected supplier no longer exists.';
  else if (supplier.status !== STATUS.ACTIVE) {
    errors.supplierId = 'Inactive suppliers cannot be used for new stock receipts.';
  }

  const quantityError = checkQuantity(values.quantity, 'Quantity received');
  if (quantityError) errors.quantity = quantityError;

  const cost = String(values.unitCost ?? '').trim();
  if (cost === '') errors.unitCost = 'Unit cost is required.';
  else if (!(Number(cost) > 0)) errors.unitCost = 'Unit cost must be greater than zero.';
  else if (!MONEY_PATTERN.test(cost)) {
    errors.unitCost = 'Enter a valid amount with at most 2 decimal places.';
  }

  if ((values.reference ?? '').trim().length > 50) {
    errors.reference = 'Reference number must be 50 characters or fewer.';
  }
  if ((values.remarks ?? '').trim().length > 500) {
    errors.remarks = 'Remarks must be 500 characters or fewer.';
  }

  return errors;
}

export function validateStockOut(values, { product, availableStock }) {
  const errors = {};

  const productError = checkProduct(product);
  if (productError) errors.productId = productError;

  const quantityError = checkQuantity(values.quantity, 'Quantity issued');
  if (quantityError) {
    errors.quantity = quantityError;
  } else if (product && Number(values.quantity) > availableStock) {
    errors.quantity = `Cannot issue ${Number(values.quantity)}. Only ${availableStock} available in stock.`;
  }

  const issuedToError = checkRequiredText(values.issuedTo, 'Issued to', 100);
  if (issuedToError) errors.issuedTo = issuedToError;

  const departmentError = checkRequiredText(values.department, 'Department', 100);
  if (departmentError) errors.department = departmentError;

  const purposeError = checkRequiredText(values.purpose, 'Purpose', 200);
  if (purposeError) errors.purpose = purposeError;

  return errors;
}

export function validateAdjustment(values, { product, availableStock }) {
  const errors = {};

  const productError = checkProduct(product);
  if (productError) errors.productId = productError;

  const actual = String(values.actualStock ?? '').trim();
  if (actual === '') errors.actualStock = 'Actual stock is required.';
  else if (!INTEGER_PATTERN.test(actual)) {
    errors.actualStock = 'Actual stock must be a whole number (0 or more).';
  } else if (Number(actual) > MAX_QUANTITY) {
    errors.actualStock = 'Actual stock must not exceed 1,000,000.';
  } else if (product && Number(actual) === availableStock) {
    errors.actualStock = 'Actual stock is the same as the system stock. No adjustment is needed.';
  }

  const reasonError = checkRequiredText(values.reason, 'Reason', 200);
  if (reasonError) errors.reason = reasonError;

  return errors;
}