import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ShutDown from '@/components/shutDown/ShutDown.vue';
import { createTestPinia } from '../../utils';
import { useSystemStore } from '@/stores/system';

describe('ShutDown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mountShutDown = () => mount(ShutDown, {
    global: {
      plugins: [createTestPinia()],
      stubs: { Bootup: { template: '<div class="bootup-stub" />' } },
    },
  });

  it('lights the LED, zooms in to the boot screen and then powers on', async () => {
    const wrapper = mountShutDown();
    const system = useSystemStore();

    expect(wrapper.find('.led-off').exists()).toBe(true);

    await wrapper.find('.start-button').trigger('click');
    expect(wrapper.find('.led-on').exists()).toBe(true);
    expect(wrapper.find('.bootup-stub').exists()).toBe(false);

    await vi.advanceTimersByTimeAsync(500);
    expect(wrapper.find('.wrapper').classes()).toContain('zoom');
    expect(wrapper.find('.bootup-stub').exists()).toBe(true);
    expect(system.powerOn).toBe(false);

    await vi.advanceTimersByTimeAsync(5000);
    expect(system.powerOn).toBe(true);
    expect(system.startup).toBe(true);
  });

  it('ignores further clicks on the power button', async () => {
    const wrapper = mountShutDown();
    const system = useSystemStore();

    await wrapper.find('.start-button').trigger('click');
    await wrapper.find('.start-button').trigger('click');
    await vi.advanceTimersByTimeAsync(10000);

    // A second togglePower would have switched it back off
    expect(system.powerOn).toBe(true);
  });
});
