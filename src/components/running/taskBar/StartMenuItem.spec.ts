import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import StartMenuItem from './StartMenuItem.vue';
import { createTestPinia } from '@/test/utils';
import { useSystemStore } from '@/stores/system';

describe('StartMenuItem', () => {
  it('shows its text and icon, and closes the start menu when clicked', async () => {
    const pinia = createTestPinia();
    const system = useSystemStore();
    system.showStartMenu = true;
    const wrapper = mount(StartMenuItem, {
      props: { text: 'Browser' },
      slots: { default: '<svg class="my-icon" />' },
      global: { plugins: [pinia] },
    });

    expect(wrapper.text()).toBe('Browser');
    expect(wrapper.find('.my-icon').exists()).toBe(true);

    await wrapper.trigger('click');

    expect(system.showStartMenu).toBe(false);
    expect(wrapper.emitted('click')).toHaveLength(1);
  });
});
