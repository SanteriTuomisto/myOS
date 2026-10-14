export const STORAGE_PREFIX = 'myOs-';
const VERSION_KEY = `${STORAGE_PREFIX}version`;
// Where the old Vuex version kept everything
const LEGACY_KEY = 'myOs-persist-store';

/**
 * Drops saved state from another app version, so new defaults (files, apps) take effect.
 * Must run before the stores are created, otherwise they hydrate from the old state.
 */
export function resetStorageOnVersionChange(storage: Storage, version: string): void {
  if (storage.getItem(VERSION_KEY) === version) {
    return;
  }
  const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i));
  keys
    .filter((key): key is string => key != null && (key.startsWith(STORAGE_PREFIX) || key === LEGACY_KEY))
    .forEach((key) => storage.removeItem(key));
  storage.setItem(VERSION_KEY, version);
}

export const storageKey = (storeId: string): string => `${STORAGE_PREFIX}${storeId}`;
