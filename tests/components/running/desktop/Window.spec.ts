import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Pinia } from 'pinia';
import Window from '@/components/running/desktop/Window.vue';
import { createTestPinia } from '../../../utils';
import { useApplicationsStore } from '@/stores/applications';
import type { Application } from '@/types';

describe('Window', () => {
  let pinia: Pinia;
  let applications: ReturnType<typeof useApplicationsStore>;

  beforeEach(() => {
    pinia = createTestPinia();
    applications = useApplicationsStore();
  });

  const mountWindow = (app: Application) => mount(Window, {
    props: { app },
    slots: { default: '<p class="content">Hello</p>' },
    global: { plugins: [pinia] },
  });

  const buttons = (wrapper: ReturnType<typeof mountWindow>) => wrapper.findAll('.topbar-buttons > div');

  it('shows the app name and its content', () => {
    const app = applications.openApplication({ name: 'Browser', type: 'browser' });
    const wrapper = mountWindow(app);

    expect(wrapper.find('.drag-container-1').text()).toContain('Browser');
    expect(wrapper.find('.content').text()).toBe('Hello');
  });

  it('saves its position and size to the store when mounted', () => {
    const app = applications.openApplication({ name: 'Browser', type: 'browser' });
    mountWindow(app);

    expect(applications.getApplicationById(app.id)?.size).toBeDefined();
    expect(applications.getApplicationById(app.id)?.position).toBeDefined();
  });

  it('restores a saved position and size', () => {
    const app = applications.openApplication({ name: 'Browser', type: 'browser' });
    applications.updateApplication(app.id, { position: { top: 10, left: 20 }, size: { width: 600, height: 450 } });
    const wrapper = mountWindow(app);

    const style = (wrapper.element as HTMLElement).style;
    expect(style.width).toBe('600px');
    expect(style.height).toBe('450px');
    expect(style.left).toBe('20px');
    expect(style.top).toBe('10px');
  });

  it('minimizes, which hides it and clears the active window', async () => {
    const app = applications.openApplication({ name: 'Browser', type: 'browser' });
    const wrapper = mountWindow(app);

    await buttons(wrapper)[0].trigger('click');

    expect(applications.getApplicationById(app.id)?.minimized).toBe(true);
    expect(applications.activeWindowId).toBeNull();
    expect((wrapper.element as HTMLElement).style.display).toBe('none');
  });

  it('toggles maximized with the button and by double clicking the title bar', async () => {
    const app = applications.openApplication({ name: 'Browser', type: 'browser' });
    const wrapper = mountWindow(app);

    await buttons(wrapper)[1].trigger('click');
    expect(applications.getApplicationById(app.id)?.maximized).toBe(true);
    expect(wrapper.classes()).toContain('active-full');

    await wrapper.find('.drag-container-1').trigger('dblclick');
    expect(applications.getApplicationById(app.id)?.maximized).toBe(false);
    expect(wrapper.classes()).toContain('active-window');
  });

  it('closes the app', async () => {
    const app = applications.openApplication({ name: 'Browser', type: 'browser' });
    const wrapper = mountWindow(app);

    await buttons(wrapper)[2].trigger('click');

    expect(applications.applications).toEqual([]);
  });

  it('becomes active when clicked and follows the active window from the store', async () => {
    const first = applications.openApplication({ name: 'Browser', type: 'browser' });
    const second = applications.openApplication({ name: 'Terminal', type: 'terminal' });
    const wrapper = mountWindow(first);
    applications.setActiveWindow(second.id);
    await wrapper.vm.$nextTick();

    expect(wrapper.classes()).toContain('inactive-window');

    await wrapper.trigger('click');
    expect(applications.activeWindowId).toBe(first.id);
    expect(wrapper.classes()).toContain('active-window');
  });

  it('shows again when restored from the store', async () => {
    const app = applications.openApplication({ name: 'Browser', type: 'browser' });
    const wrapper = mountWindow(app);
    await buttons(wrapper)[0].trigger('click');

    applications.setActiveWindow(app.id);
    await wrapper.vm.$nextTick();

    expect((wrapper.element as HTMLElement).style.display).not.toBe('none');
  });

  it('stays minimized when mounted minimized', () => {
    const other = applications.openApplication({ name: 'Terminal', type: 'terminal' });
    const app = applications.openApplication({ name: 'Browser', type: 'browser' });
    applications.updateApplication(app.id, { minimized: true });
    applications.setActiveWindow(other.id);
    mountWindow(app);

    expect(applications.getApplicationById(app.id)?.minimized).toBe(true);
    expect(applications.activeWindowId).toBe(other.id);
  });
});
