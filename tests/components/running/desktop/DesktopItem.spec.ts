import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import DesktopItem from '@/components/running/desktop/DesktopItem.vue';
import { stubSmallScreen } from '../../../utils';

describe('DesktopItem', () => {
  it('shows its name and icon slot', () => {
    const wrapper = mount(DesktopItem, {
      props: { name: 'Browser' },
      slots: { default: '<svg class="my-icon" />' },
    });

    expect(wrapper.find('.item-name').text()).toBe('Browser');
    expect(wrapper.find('.icon .my-icon').exists()).toBe(true);
  });

  it('emits click on double click only', async () => {
    const wrapper = mount(DesktopItem, { props: { name: 'Browser' } });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();

    await wrapper.trigger('dblclick');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('opens on a single tap on phones, and ignores double taps', async () => {
    stubSmallScreen(true);
    const wrapper = mount(DesktopItem, { props: { name: 'Browser' } });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);

    await wrapper.trigger('dblclick');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });
});
