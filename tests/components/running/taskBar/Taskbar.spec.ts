import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Pinia } from 'pinia';
import Taskbar from '@/components/running/taskBar/Taskbar.vue';
import { createTestPinia } from '../../../utils';
import { useApplicationsStore } from '@/stores/applications';
import { useSystemStore } from '@/stores/system';

describe('Taskbar', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createTestPinia();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 1, 9, 5));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mountTaskbar = () => mount(Taskbar, { global: { plugins: [pinia] } });

  it('shows one item per open app', async () => {
    const applications = useApplicationsStore();
    applications.openApplication({ name: 'Browser', type: 'browser' });
    const wrapper = mountTaskbar();

    expect(wrapper.findAll('.taskbarItems .menu-item').map((item) => item.text())).toEqual(['Browser']);

    applications.openApplication({ name: 'Terminal', type: 'terminal' });
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.taskbarItems .menu-item').map((item) => item.text())).toEqual(['Browser', 'Terminal']);

    applications.closeApplication(0);
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.taskbarItems .menu-item').map((item) => item.text())).toEqual(['Terminal']);
  });

  it('clicking an item brings it to the front, clicking again minimizes it', async () => {
    const applications = useApplicationsStore();
    const browser = applications.openApplication({ name: 'Browser', type: 'browser' });
    const terminal = applications.openApplication({ name: 'Terminal', type: 'terminal' });
    const wrapper = mountTaskbar();

    await wrapper.findAll('.taskbarItems .menu-item')[0].trigger('click');
    expect(applications.activeWindowId).toBe(browser.id);

    await wrapper.findAll('.taskbarItems .menu-item')[0].trigger('click');
    expect(applications.getApplicationById(browser.id)?.minimized).toBe(true);
    expect(applications.activeWindowId).toBe(terminal.id);
  });

  it('opens the start menu with the Start button and closes it from the backdrop', async () => {
    const system = useSystemStore();
    const wrapper = mountTaskbar();

    expect(wrapper.find('#menu').exists()).toBe(false);

    await wrapper.find('.start-menu-btn').trigger('click');
    expect(system.showStartMenu).toBe(true);
    expect(wrapper.find('#menu').exists()).toBe(true);

    await wrapper.find('.start-menu-backdrop').trigger('click');
    expect(system.showStartMenu).toBe(false);
    expect(wrapper.find('#menu').exists()).toBe(false);
  });

  it('shows the time and keeps it up to date', async () => {
    const wrapper = mountTaskbar();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.time').text()).toBe('9:05');

    await vi.advanceTimersByTimeAsync(60_000);
    expect(wrapper.find('.time').text()).toBe('9:06');
  });
});
