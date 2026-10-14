import { beforeEach, describe, expect, it } from 'vitest';
import { resetStorageOnVersionChange, storageKey } from './persistence';

describe('resetStorageOnVersionChange', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps saved state when the version matches', () => {
    localStorage.setItem('myOs-version', '1.0.0');
    localStorage.setItem('myOs-fileSystem', '{}');

    resetStorageOnVersionChange(localStorage, '1.0.0');

    expect(localStorage.getItem('myOs-fileSystem')).toBe('{}');
  });

  it('clears myOS state, including the old Vuex key, when the version changes', () => {
    localStorage.setItem('myOs-version', '1.0.0');
    localStorage.setItem('myOs-fileSystem', '{}');
    localStorage.setItem('myOs-persist-store', '{}');
    localStorage.setItem('someone-else', 'keep');

    resetStorageOnVersionChange(localStorage, '2.0.0');

    expect(localStorage.getItem('myOs-fileSystem')).toBeNull();
    expect(localStorage.getItem('myOs-persist-store')).toBeNull();
    expect(localStorage.getItem('someone-else')).toBe('keep');
    expect(localStorage.getItem('myOs-version')).toBe('2.0.0');
  });

  it('records the version on first visit', () => {
    resetStorageOnVersionChange(localStorage, '2.0.0');

    expect(localStorage.getItem('myOs-version')).toBe('2.0.0');
  });
});

describe('storageKey', () => {
  it('prefixes the store id', () => {
    expect(storageKey('settings')).toBe('myOs-settings');
  });
});
