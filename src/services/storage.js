// Low-level helpers. Nothing else in the app should call localStorage directly.

export function hasKey(key) {
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

/**
 * Reads and parses a value.
 * Returns { status: 'ok' | 'missing' | 'corrupted' | 'error', data }
 */
export function readStorage(key, fallback) {
  let raw;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return { status: 'error', data: fallback };
  }

  if (raw === null) return { status: 'missing', data: fallback };

  try {
    return { status: 'ok', data: JSON.parse(raw) };
  } catch {
    // Keep a copy of the bad data so nothing is lost
    try {
      localStorage.setItem(`${key}_corrupted_backup`, raw);
    } catch {
      /* ignore */
    }
    return { status: 'corrupted', data: fallback };
  }
}

/** Reads a key that must contain an array (products, transactions, ...). */
export function readCollection(key) {
  const result = readStorage(key, []);
  if (result.status === 'ok' && !Array.isArray(result.data)) {
    return { status: 'corrupted', data: [] };
  }
  return result;
}

/** Writes a value. Returns { ok: true } or { ok: false, error }. */
export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}