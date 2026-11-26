import { STORAGE_KEYS } from '../utils/constants';
import { hasKey, readStorage, writeStorage } from './storage';
import { buildSeedData } from '../data/seedData';

/**
 * Loads sample data ONLY on the very first run.
 * Returns { seeded: boolean, error?: string }
 */
export function initializeData() {
  const settings = readStorage(STORAGE_KEYS.SETTINGS, null);

  const dataKeys = [
    STORAGE_KEYS.PRODUCTS,
    STORAGE_KEYS.CATEGORIES,
    STORAGE_KEYS.SUPPLIERS,
    STORAGE_KEYS.TRANSACTIONS,
  ];
  const anyDataExists = dataKeys.some(hasKey);

  // Already initialised, or user data exists: never overwrite
  if (settings.status !== 'missing' || anyDataExists) {
    return { seeded: false };
  }

  const seed = buildSeedData();
  const writes = [
    writeStorage(STORAGE_KEYS.CATEGORIES, seed.categories),
    writeStorage(STORAGE_KEYS.SUPPLIERS, seed.suppliers),
    writeStorage(STORAGE_KEYS.PRODUCTS, seed.products),
    writeStorage(STORAGE_KEYS.TRANSACTIONS, seed.transactions),
    writeStorage(STORAGE_KEYS.SETTINGS, { seeded: true, seededAt: new Date().toISOString() }),
  ];

  if (writes.some((w) => !w.ok)) {
    return { seeded: false, error: 'Could not save sample data to browser storage.' };
  }
  return { seeded: true };
}