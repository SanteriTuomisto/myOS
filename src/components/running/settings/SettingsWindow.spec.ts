import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Pinia } from 'pinia';
import SettingsWindow from './SettingsWindow.vue';
import { createTestPinia } from '@/test/utils';
import { useSettingsStore } from '@/stores/settings';

describe('SettingsWindow', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createTestPinia();
  });

  const selectedButtons = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findAll('button.button-selected').map((b) => b.text());

  it('has no background selected by default (green)', () => {
    const wrapper = mount(SettingsWindow, { global: { plugins: [pinia] } });

    expect(wrapper.findAll('button').map((b) => b.text())).toEqual(['1', '2', '3']);
    expect(selectedButtons(wrapper)).toEqual([]);
  });

  it('sets the background and marks the button selected', async () => {
    const wrapper = mount(SettingsWindow, { global: { plugins: [pinia] } });
    const settings = useSettingsStore();

    await wrapper.findAll('button')[1].trigger('click');
    expect(settings.background).toBe('2');
    expect(selectedButtons(wrapper)).toEqual(['2']);

    await wrapper.findAll('button')[2].trigger('click');
    expect(settings.background).toBe('3');
    expect(selectedButtons(wrapper)).toEqual(['3']);
  });

  it('reflects a background set elsewhere', async () => {
    const wrapper = mount(SettingsWindow, { global: { plugins: [pinia] } });

    useSettingsStore().setBackground('1');
    await wrapper.vm.$nextTick();

    expect(selectedButtons(wrapper)).toEqual(['1']);
  });
});
