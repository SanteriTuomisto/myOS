import { vi } from 'vitest';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { SMALL_SCREEN_QUERY } from '@/composables/useSmallScreen';

/** Fresh Pinia for one test. Pass it to mount via `global: { plugins: [pinia] }`. */
export function createTestPinia(): Pinia {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
}

type ChangeListener = (event: { matches: boolean }) => void;

/**
 * Fakes the screen size for useSmallScreen. Returns a function that changes it live,
 * like rotating a phone. Globals are unstubbed after each test (`unstubGlobals` in the config).
 */
export function stubSmallScreen(small: boolean): (small: boolean) => void {
  let matches = small;
  const listeners = new Set<ChangeListener>();
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return query === SMALL_SCREEN_QUERY && matches;
    },
    addEventListener: (_type: string, listener: ChangeListener) => listeners.add(listener),
    removeEventListener: (_type: string, listener: ChangeListener) => listeners.delete(listener),
  }));
  return (next: boolean) => {
    matches = next;
    listeners.forEach((listener) => listener({ matches: next }));
  };
}
