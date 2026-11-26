import { STATUS, STORAGE_KEYS } from '../utils/constants';
import { generateId } from '../utils/id';
import { hasErrors, validateCategory } from '../utils/validators';
import { readCollection } from './storage';
import { loadForUpdate, saveItems } from './repository';

const KEY = STORAGE_KEYS.CATEGORIES;

export function getCategories() {
  return readCollection(KEY);
}

// Business rule: a category used by an ACTIVE product cannot be deactivated
function checkCanDeactivate(categoryId) {
  const products = readCollection(STORAGE_KEYS.PRODUCTS);
  if (products.status === 'corrupted' || products.status === 'error') {
    return {
      ok: false,
      message: 'Product data could not be read, so this category cannot be safely deactivated.',
    };
  }
  const count = products.data.filter(
    (p) => p.categoryId === categoryId && p.status === STATUS.ACTIVE
  ).length;

  if (count > 0) {
    return {
      ok: false,
      message: `Cannot deactivate: ${count} active product${count > 1 ? 's use' : ' uses'} this category.`,
    };
  }
  return { ok: true };
}

export function addCategory(values) {
  const loaded = loadForUpdate(KEY);
  if (!loaded.ok) return loaded;

  const errors = validateCategory(values, loaded.items);
  if (hasErrors(errors)) return { ok: false, errors };

  const category = {
    id: generateId('cat'),
    code: values.code.trim(),
    name: values.name.trim(),
    description: (values.description ?? '').trim(),
    status: values.status,
  };

  const saved = saveItems(KEY, [...loaded.items, category]);
  return saved.ok ? { ok: true, category } : saved;
}

export function updateCategory(id, values) {
  const loaded = loadForUpdate(KEY);
  if (!loaded.ok) return loaded;

  const index = loaded.items.findIndex((c) => c.id === id);
  if (index === -1) return { ok: false, message: 'Category not found. It may have been removed.' };
  const existing = loaded.items[index];

  // The code is locked after creation, so always keep the saved one
  const input = { ...values, code: existing.code };
  const errors = validateCategory(input, loaded.items, id);

  if (!errors.status && existing.status === STATUS.ACTIVE && input.status === STATUS.INACTIVE) {
    const check = checkCanDeactivate(id);
    if (!check.ok) errors.status = check.message;
  }
  if (hasErrors(errors)) return { ok: false, errors };

  const items = [...loaded.items];
  items[index] = {
    ...existing,
    name: input.name.trim(),
    description: (input.description ?? '').trim(),
    status: input.status,
  };
  return saveItems(KEY, items);
}

// Used by the Deactivate / Activate button in the table
export function setCategoryStatus(id, status) {
  const loaded = loadForUpdate(KEY);
  if (!loaded.ok) return loaded;

  const index = loaded.items.findIndex((c) => c.id === id);
  if (index === -1) return { ok: false, message: 'Category not found. It may have been removed.' };

  if (status === STATUS.INACTIVE) {
    const check = checkCanDeactivate(id);
    if (!check.ok) return check;
  }

  const items = [...loaded.items];
  items[index] = { ...items[index], status };
  return saveItems(KEY, items);
}