import { STATUS, UNITS } from './constants';

const CODE_PATTERN = /^[A-Za-z0-9_-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\-\s()]{7,15}$/;
const INTEGER_PATTERN = /^\d+$/;
const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;
const MAX_QUANTITY = 1000000;

export const hasErrors = (errors) => Object.keys(errors).length > 0;

const sameText = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

// Returns an error message, or null when the code is fine
function validateCode(code, label, others) {
  if (!code) return `${label} code is required.`;
  if (code.length > 20) return `${label} code must be 20 characters or fewer.`;
  if (!CODE_PATTERN.test(code)) return 'Use only letters, numbers, hyphen (-) and underscore (_).';
  if (others.some((item) => sameText(item.code, code))) {
    return `This ${label.toLowerCase()} code already exists.`;
  }
  return null;
}

function validateWholeNumber(value, label) {
  const text = String(value ?? '').trim();
  if (text === '') return `${label} is required.`;
  if (!INTEGER_PATTERN.test(text)) return `${label} must be a whole number (0 or more).`;
  if (Number(text) > MAX_QUANTITY) return `${label} must not exceed 1,000,000.`;
  return null;
}

// ---------- Category validation ----------
/**
 * values     : what the user typed
 * existing   : all saved categories
 * editingId  : id of the category being edited (so it doesn't clash with itself)
 */
export function validateCategory(values, existing, editingId = null) {
  const errors = {};
  const code = (values.code ?? '').trim();
  const name = (values.name ?? '').trim();
  const description = values.description ?? '';
  const others = existing.filter((c) => c.id !== editingId);

  const codeError = validateCode(code, 'Category', others);
  if (codeError) errors.code = codeError;

  if (!name) errors.name = 'Category name is required.';
  else if (name.length > 50) errors.name = 'Category name must be 50 characters or fewer.';
  else if (others.some((c) => sameText(c.name, name))) {
    errors.name = 'A category with this name already exists.';
  }

  if (description.length > 500) errors.description = 'Description must be 500 characters or fewer.';
  if (!Object.values(STATUS).includes(values.status)) errors.status = 'Select a valid status.';

  return errors;
}

// ---------- Supplier validation ----------
export function validateSupplier(values, existing, editingId = null) {
  const errors = {};
  const code = (values.code ?? '').trim();
  const name = (values.name ?? '').trim();
  const contactPerson = (values.contactPerson ?? '').trim();
  const email = (values.email ?? '').trim();
  const phone = (values.phone ?? '').trim();
  const others = existing.filter((s) => s.id !== editingId);

  const codeError = validateCode(code, 'Supplier', others);
  if (codeError) errors.code = codeError;

  if (!name) errors.name = 'Supplier name is required.';
  else if (name.length > 100) errors.name = 'Supplier name must be 100 characters or fewer.';

  if (contactPerson.length > 100) errors.contactPerson = 'Contact person must be 100 characters or fewer.';

  // Email is optional, but must be valid when entered
  if (email && (!EMAIL_PATTERN.test(email) || email.length > 100)) {
    errors.email = 'Enter a valid email address.';
  }

  if (phone && !PHONE_PATTERN.test(phone)) {
    errors.phone = 'Enter a valid phone number (7 to 15 characters: digits, +, -, spaces, brackets).';
  }

  if (!Object.values(STATUS).includes(values.status)) errors.status = 'Select a valid status.';

  return errors;
}

// ---------- Product validation ----------
/**
 * values  : what the user typed (all strings)
 * context : { products, categories, suppliers } saved lists
 * editing : the saved product when editing, null when creating
 */
export function validateProduct(values, { products, categories, suppliers }, editing = null) {
  const errors = {};
  const isEdit = Boolean(editing);
  const name = (values.name ?? '').trim();
  const description = values.description ?? '';

  // Code and opening stock are only checked on creation (locked afterwards)
  if (!isEdit) {
    const codeError = validateCode((values.code ?? '').trim(), 'Product', products);
    if (codeError) errors.code = codeError;

    const openingError = validateWholeNumber(values.openingStock, 'Opening stock');
    if (openingError) errors.openingStock = openingError;
  }

  if (!name) errors.name = 'Product name is required.';
  else if (name.length < 3 || name.length > 100) {
    errors.name = 'Product name must be between 3 and 100 characters.';
  }

  const category = categories.find((c) => c.id === values.categoryId);
  const categoryChanged = !isEdit || editing.categoryId !== values.categoryId;
  if (!values.categoryId) errors.categoryId = 'Select a category.';
  else if (!category) errors.categoryId = 'The selected category no longer exists.';
  else if (
    category.status !== STATUS.ACTIVE &&
    (categoryChanged || values.status === STATUS.ACTIVE)
  ) {
    errors.categoryId = 'This category is inactive. Choose an active category.';
  }

  const supplier = suppliers.find((s) => s.id === values.supplierId);
  const supplierChanged = !isEdit || editing.supplierId !== values.supplierId;
  if (!values.supplierId) errors.supplierId = 'Select a supplier.';
  else if (!supplier) errors.supplierId = 'The selected supplier no longer exists.';
  else if (supplier.status !== STATUS.ACTIVE && supplierChanged) {
    errors.supplierId = 'This supplier is inactive. Choose an active supplier.';
  }

  if (description.length > 500) errors.description = 'Description must be 500 characters or fewer.';
  if (!UNITS.includes(values.unit)) errors.unit = 'Select a unit of measure.';

  const cost = String(values.unitCost ?? '').trim();
  if (cost === '') errors.unitCost = 'Unit cost is required.';
  else if (!(Number(cost) > 0)) errors.unitCost = 'Unit cost must be greater than zero.';
  else if (!MONEY_PATTERN.test(cost)) {
    errors.unitCost = 'Enter a valid amount with at most 2 decimal places.';
  }

  const reorderError = validateWholeNumber(values.reorderLevel, 'Reorder level');
  if (reorderError) errors.reorderLevel = reorderError;

  if (!Object.values(STATUS).includes(values.status)) errors.status = 'Select a valid status.';

  return errors;
}