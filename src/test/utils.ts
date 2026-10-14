import { createPinia, setActivePinia, type Pinia } from 'pinia';

/** Fresh Pinia for one test. Pass it to mount via `global: { plugins: [pinia] }`. */
export function createTestPinia(): Pinia {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
}
