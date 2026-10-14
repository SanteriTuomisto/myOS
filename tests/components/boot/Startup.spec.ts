import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Startup from '@/components/boot/Startup.vue';
import { createTestPinia } from '../../utils';
import { useSystemStore } from '@/stores/system';

const stubs = { Eyeball: true, Bubbles: true };

describe('Startup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ends the startup after 5 seconds', () => {
    const pinia = createTestPinia();
    const system = useSystemStore();
    system.startup = true;
    mount(Startup, { global: { plugins: [pinia], stubs } });

    vi.advanceTimersByTime(4999);
    expect(system.startup).toBe(true);

    vi.advanceTimersByTime(1);
    expect(system.startup).toBe(false);
  });

  it('does not touch the store once unmounted', () => {
    const pinia = createTestPinia();
    const system = useSystemStore();
    system.startup = true;
    const wrapper = mount(Startup, { global: { plugins: [pinia], stubs } });

    wrapper.unmount();
    vi.advanceTimersByTime(5000);

    expect(system.startup).toBe(true);
  });
});
