import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Pinia } from 'pinia';
import type { DefineComponent } from 'vue';
import VueResizableModule from 'vue-resizable';
import Window from '@/components/running/desktop/Window.vue';
import { createTestPinia, stubSmallScreen } from '../../../utils';
import { useApplicationsStore } from '@/stores/applications';
import type { Application } from '@/types';

const VueResizable = 'default' in VueResizableModule ? VueResizableModule.default : VueResizableModule;

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

  it('minimizing activates the next visible window', async () => {
    const other = applications.openApplication({ name: 'Terminal', type: 'terminal' });
    const app = applications.openApplication({ name: 'Browser', type: 'browser' });
    const wrapper = mountWindow(app);

    await buttons(wrapper)[0].trigger('click');

    expect(applications.activeWindowId).toBe(other.id);
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

  it('mounting keeps the saved active window (e.g. after a reload)', () => {
    const first = applications.openApplication({ name: 'Browser', type: 'browser' });
    const second = applications.openApplication({ name: 'Terminal', type: 'terminal' });
    applications.setActiveWindow(first.id);

    mountWindow(first);
    mountWindow(second);

    expect(applications.activeWindowId).toBe(first.id);
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

  describe('interactive slot prop', () => {
    const mountWithSlotProp = (app: Application) => mount(Window, {
      props: { app },
      slots: { default: `<template #default="{ interactive }"><p class="content">{{ interactive }}</p></template>` },
      global: { plugins: [pinia] },
    });
    const resizableEvent = (eventName: string) => ({ eventName, left: 0, top: 0, width: 500, height: 350 });

    it('is true only for the active window', async () => {
      const first = applications.openApplication({ name: 'Synth', type: 'synth' });
      const second = applications.openApplication({ name: 'Excavator', type: 'excavator' });
      const firstWrapper = mountWithSlotProp(first);
      const secondWrapper = mountWithSlotProp(second);

      applications.setActiveWindow(second.id);
      await firstWrapper.vm.$nextTick();

      expect(firstWrapper.find('.content').text()).toBe('false');
      expect(secondWrapper.find('.content').text()).toBe('true');
    });

    it('is false while the window is dragged or resized', async () => {
      const app = applications.openApplication({ name: 'Synth', type: 'synth' });
      const wrapper = mountWithSlotProp(app);
      const resizable = wrapper.findComponent(VueResizable as DefineComponent);

      for (const [eventName, expected] of [
        ['drag:start', 'false'], ['drag:move', 'false'], ['drag:end', 'true'],
        ['resize:start', 'false'], ['resize:end', 'true'],
      ]) {
        resizable.vm.$emit(eventName, resizableEvent(eventName));
        await wrapper.vm.$nextTick();
        expect(wrapper.find('.content').text(), eventName).toBe(expected);
      }
    });
  });

  describe('on phones', () => {
    const resizableOf = (wrapper: ReturnType<typeof mountWindow>) =>
      wrapper.findComponent(VueResizable as DefineComponent);
    // vue-resizable ships no types, so its props are read as a plain record
    const resizableProps = (wrapper: ReturnType<typeof mountWindow>) =>
      resizableOf(wrapper).props() as Record<string, unknown>;

    it('shows the window full screen, without drag, resize or maximize', () => {
      stubSmallScreen(true);
      const app = applications.openApplication({ name: 'Browser', type: 'browser' });
      const wrapper = mountWindow(app);
      const props = resizableProps(wrapper);

      expect(props.maximize).toBe(true);
      expect(props.active).toEqual([]);
      expect(props.dragSelector).toBe('.no-drag');
      expect(buttons(wrapper)).toHaveLength(2);
      expect(resizableOf(wrapper).classes()).toContain('mobile');
    });

    it('does not save the full-screen geometry or maximize the saved window', async () => {
      stubSmallScreen(true);
      const app = applications.openApplication({ name: 'Browser', type: 'browser' });
      const wrapper = mountWindow(app);
      const savedSize = { ...applications.getApplicationById(app.id)!.size! };

      resizableOf(wrapper).vm.$emit('resize:end', { eventName: 'resize:end', left: 0, top: 0, width: 375, height: 766 });
      await wrapper.find('.drag-container-1').trigger('dblclick');

      const saved = applications.getApplicationById(app.id)!;
      expect(saved.size).toEqual(savedSize);
      expect(saved.maximized).toBe(false);
    });

    it('still activates the window when it is touched', () => {
      stubSmallScreen(true);
      const first = applications.openApplication({ name: 'Browser', type: 'browser' });
      applications.openApplication({ name: 'Terminal', type: 'terminal' });
      const wrapper = mountWindow(first);

      resizableOf(wrapper).vm.$emit('drag:start', { eventName: 'drag:start', left: 0, top: 0, width: 375, height: 766 });

      expect(applications.activeWindowId).toBe(first.id);
    });

    // What vue-resizable reports when leaving full screen: the geometry it saw before, here phone-sized
    const leaveFullScreen = (wrapper: ReturnType<typeof mountWindow>) => {
      const resizable = { $el: { parentElement: { clientWidth: 1024, clientHeight: 722 } }, w: 375, h: 766, l: 0, t: 0 };
      resizableOf(wrapper).vm.$emit('maximize', { eventName: 'maximize', state: false, left: 0, top: 0, width: 375, height: 766, cmp: resizable });
      return resizable;
    };

    it('leaving full screen puts back the real size, centered if opened on a phone', () => {
      const setSmall = stubSmallScreen(true);
      const app = applications.openApplication({ name: 'Browser', type: 'browser' });
      const wrapper = mountWindow(app);

      // Checked before the next render: the real vue-resizable can't lay out in tests and would redo this
      setSmall(false);
      const resizable = leaveFullScreen(wrapper);

      expect(resizable).toMatchObject({ w: 500, h: 350, l: 262, t: 186 });
      expect(applications.getApplicationById(app.id)).toMatchObject({
        size: { width: 500, height: 350 },
        position: { left: 262, top: 186 },
      });
    });

    it('leaving full screen keeps a moved window inside the screen', () => {
      // Starts wide: the real vue-resizable can't lay out in tests, so only the event below runs
      stubSmallScreen(false);
      const app = applications.openApplication({ name: 'Browser', type: 'browser' });
      applications.updateApplication(app.id, { position: { left: 900, top: -40 }, size: { width: 500, height: 350 } });
      const wrapper = mountWindow(applications.getApplicationById(app.id)!);

      expect(leaveFullScreen(wrapper)).toMatchObject({ l: 524, t: 0 });
    });

    it('gets the normal window back when the screen gets wide', async () => {
      const setSmall = stubSmallScreen(true);
      const app = applications.openApplication({ name: 'Browser', type: 'browser' });
      const wrapper = mountWindow(app);

      setSmall(false);
      await wrapper.vm.$nextTick();

      const props = resizableProps(wrapper);
      expect(props.maximize).toBe(false);
      expect(props.active).toHaveLength(8);
      expect(props.dragSelector).toBe('.drag-container-1');
      expect(buttons(wrapper)).toHaveLength(3);
    });
  });
});
