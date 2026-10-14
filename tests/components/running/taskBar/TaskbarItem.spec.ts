import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Pinia } from 'pinia';
import TaskbarItem from '@/components/running/taskBar/TaskbarItem.vue';
import { createTestPinia } from '../../../utils';
import { useApplicationsStore } from '@/stores/applications';

describe('TaskbarItem', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createTestPinia();
  });

  it('shows the app name and whether it is active', async () => {
    const applications = useApplicationsStore();
    const first = applications.openApplication({ name: 'Browser', type: 'browser' });
    const wrapper = mount(TaskbarItem, { props: { app: first }, global: { plugins: [pinia] } });

    expect(wrapper.text()).toBe('Browser');
    expect(wrapper.classes()).toContain('active');

    applications.openApplication({ name: 'Terminal', type: 'terminal' });
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).toContain('inactive');
  });

  it('clicking toggles the window active', async () => {
    const applications = useApplicationsStore();
    const app = applications.openApplication({ name: 'Browser', type: 'browser' });
    const wrapper = mount(TaskbarItem, { props: { app }, global: { plugins: [pinia] } });

    await wrapper.trigger('click');
    expect(applications.activeWindowId).toBeNull();
    expect(wrapper.classes()).toContain('inactive');

    await wrapper.trigger('click');
    expect(applications.activeWindowId).toBe(app.id);
    expect(wrapper.classes()).toContain('active');
  });

  it('clicking a minimized app restores it', async () => {
    const applications = useApplicationsStore();
    const app = applications.openApplication({ name: 'Browser', type: 'browser' });
    applications.updateApplication(app.id, { minimized: true });
    applications.setActiveWindow(null);
    const wrapper = mount(TaskbarItem, { props: { app }, global: { plugins: [pinia] } });

    await wrapper.trigger('click');

    expect(applications.getApplicationById(app.id)?.minimized).toBe(false);
    expect(applications.activeWindowId).toBe(app.id);
  });
});
