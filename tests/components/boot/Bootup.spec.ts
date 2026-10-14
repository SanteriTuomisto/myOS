import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Bootup from '@/components/boot/Bootup.vue';
import { createTestPinia } from '../../utils';
import { useSystemStore } from '@/stores/system';

describe('Bootup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('prints the boot lines one by one', async () => {
    const pinia = createTestPinia();
    const wrapper = mount(Bootup, { global: { plugins: [pinia] } });
    const version = useSystemStore().version;

    expect(wrapper.text()).not.toContain('VERSION');

    await vi.advanceTimersByTimeAsync(700);
    expect(wrapper.text()).toContain(`VERSION ${version}`);
    expect(wrapper.text()).not.toContain('CPU');

    await vi.advanceTimersByTimeAsync(700);
    expect(wrapper.text()).toContain('CPU: Intel (R) CPU 330');
    expect(wrapper.text()).not.toContain('Booting');

    await vi.advanceTimersByTimeAsync(700);
    expect(wrapper.text()).toContain('Booting from Hard Disk...');
  });
});
