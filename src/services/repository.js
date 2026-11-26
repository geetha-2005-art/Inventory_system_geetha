import { readCollection, writeStorage } from './storage';

/**
 * Loads a collection before changing it.
 * If the saved data is corrupted we STOP, because saving now would overwrite it.
 */
export function loadForUpdate(key) {
  const result = readCollection(key);
  if (result.status === 'corrupted' || result.status === 'error') {
    return {
      ok: false,
      message:
        'Saved data could not be read, so no changes were made. Your existing data has not been overwritten.',
    };
  }
  return { ok: true, items: result.data };
}

export function saveItems(key, items) {
  const result = writeStorage(key, items);
  if (!result.ok) {
    return {
      ok: false,
      message: 'Could not save to browser storage. Storage may be full or disabled.',
    };
  }
  return { ok: true };
}