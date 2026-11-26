import { STORAGE_KEYS } from '../utils/constants';
import { generateId } from '../utils/id';
import { hasErrors, validateSupplier } from '../utils/validators';
import { readCollection } from './storage';
import { loadForUpdate, saveItems } from './repository';

const KEY = STORAGE_KEYS.SUPPLIERS;

export function getSuppliers() {
  return readCollection(KEY);
}

export function addSupplier(values) {
  const loaded = loadForUpdate(KEY);
  if (!loaded.ok) return loaded;

  const errors = validateSupplier(values, loaded.items);
  if (hasErrors(errors)) return { ok: false, errors };

  const supplier = {
    id: generateId('sup'),
    code: values.code.trim(),
    name: values.name.trim(),
    contactPerson: (values.contactPerson ?? '').trim(),
    email: (values.email ?? '').trim(),
    phone: (values.phone ?? '').trim(),
    status: values.status,
  };

  const saved = saveItems(KEY, [...loaded.items, supplier]);
  return saved.ok ? { ok: true, supplier } : saved;
}

export function updateSupplier(id, values) {
  const loaded = loadForUpdate(KEY);
  if (!loaded.ok) return loaded;

  const index = loaded.items.findIndex((s) => s.id === id);
  if (index === -1) return { ok: false, message: 'Supplier not found. It may have been removed.' };
  const existing = loaded.items[index];

  const input = { ...values, code: existing.code }; // code is locked
  const errors = validateSupplier(input, loaded.items, id);
  if (hasErrors(errors)) return { ok: false, errors };

  const items = [...loaded.items];
  items[index] = {
    ...existing,
    name: input.name.trim(),
    contactPerson: (input.contactPerson ?? '').trim(),
    email: (input.email ?? '').trim(),
    phone: (input.phone ?? '').trim(),
    status: input.status,
  };
  return saveItems(KEY, items);
}

export function setSupplierStatus(id, status) {
  const loaded = loadForUpdate(KEY);
  if (!loaded.ok) return loaded;

  const index = loaded.items.findIndex((s) => s.id === id);
  if (index === -1) return { ok: false, message: 'Supplier not found. It may have been removed.' };

  const items = [...loaded.items];
  items[index] = { ...items[index], status };
  return saveItems(KEY, items);
}