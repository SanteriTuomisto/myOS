import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useSettingsStore } from '@/stores/settings';

describe('settings store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('sets the desktop background', () => {
    const settings = useSettingsStore();
    expect(settings.background).toBe('green');

    settings.setBackground('2');

    expect(settings.background).toBe('2');
  });
});
