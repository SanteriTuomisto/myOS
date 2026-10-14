import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Pinia } from 'pinia';
import App from '@/App.vue';
import { createTestPinia } from './utils';
import { useSystemStore } from '@/stores/system';

const stubs = {
  ShutDown: { template: '<div class="shut-down-stub" />' },
  Startup: { template: '<div class="startup-stub" />' },
  Desktop: { template: '<div class="desktop-stub" />' },
  Taskbar: { template: '<div class="taskbar-stub" />' },
};

describe('App', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createTestPinia();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const mountApp = () => mount(App, { global: { plugins: [pinia], stubs } });

  describe('in production', () => {
    beforeEach(() => {
      vi.stubEnv('DEV', false);
    });

    it('shows the shut down screen while the power is off', () => {
      const wrapper = mountApp();

      expect(wrapper.find('.shut-down-stub').exists()).toBe(true);
      expect(wrapper.find('.desktop-stub').exists()).toBe(false);
    });

    it('shows the startup screen right after powering on, then the desktop', async () => {
      const system = useSystemStore();
      const wrapper = mountApp();

      system.togglePower();
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.startup-stub').exists()).toBe(true);
      expect(wrapper.find('.shut-down-stub').exists()).toBe(false);

      system.toggleStartup();
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.startup-stub').exists()).toBe(false);
      expect(wrapper.find('.desktop-stub').exists()).toBe(true);
      expect(wrapper.find('.taskbar-stub').exists()).toBe(true);
    });
  });

  it('goes straight to the desktop in development', () => {
    vi.stubEnv('DEV', true);
    const wrapper = mountApp();

    expect(wrapper.find('.desktop-stub').exists()).toBe(true);
    expect(wrapper.find('.shut-down-stub').exists()).toBe(false);
    expect(wrapper.find('.startup-stub').exists()).toBe(false);
  });
});
