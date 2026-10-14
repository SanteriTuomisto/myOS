import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Scroller from '@/components/_shared/Scroller.vue';

describe('Scroller', () => {
  it('scrolls with the custom scrollbar by default', () => {
    const wrapper = mount(Scroller, { slots: { default: '<p>content</p>' } });
    expect(wrapper.classes()).toEqual(['scrollbar']);
    expect(wrapper.find('p').text()).toBe('content');
  });

  it('hides overflow when scrolling is turned off', () => {
    const wrapper = mount(Scroller, { props: { scrollOn: false } });
    expect(wrapper.classes()).toEqual(['scrollOff']);
  });
});
