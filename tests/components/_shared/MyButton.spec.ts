import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import MyButton from '@/components/_shared/MyButton.vue';

describe('MyButton', () => {
  it('renders the slot with the normal style', () => {
    const wrapper = mount(MyButton, { slots: { default: 'Hello' } });
    expect(wrapper.text()).toBe('Hello');
    expect(wrapper.classes()).toEqual(['button']);
  });

  it('uses the selected style when selected', () => {
    const wrapper = mount(MyButton, { props: { selected: true } });
    expect(wrapper.classes()).toEqual(['button-selected']);
  });

  it('passes click listeners through', async () => {
    let clicks = 0;
    const wrapper = mount(MyButton, { attrs: { onClick: () => clicks++ } });
    await wrapper.trigger('click');
    expect(clicks).toBe(1);
  });
});
