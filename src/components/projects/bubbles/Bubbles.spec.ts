import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Bubbles from './Bubbles.vue';
import Eyeball from '../eyeball/Eyeball.vue';

describe('boot animations', () => {
  it('Bubbles renders a bubble and accepts a positioning class', () => {
    const wrapper = mount(Bubbles, { attrs: { class: 'slide-1' } });
    expect(wrapper.classes()).toEqual(['stage', 'slide-1']);
    expect(wrapper.find('.ball.bubble').exists()).toBe(true);
  });

  it('Eyeball renders the ball with an iris', () => {
    const wrapper = mount(Eyeball);
    expect(wrapper.find('.ball .iris').exists()).toBe(true);
    expect(wrapper.find('.ball .shadow').exists()).toBe(true);
  });
});
