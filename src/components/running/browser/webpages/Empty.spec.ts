import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Empty from './Empty.vue';

describe('Empty (404)', () => {
  it('lists every page except the 404 page and emits navigate with its url', async () => {
    const wrapper = mount(Empty);
    const links = wrapper.findAll('.link');
    expect(links.map((l) => l.text())).toEqual(['Boogle', 'Bacefook', 'DadGPT', 'myOs']);

    await links[2].trigger('click');
    expect(wrapper.emitted('navigate')).toEqual([['www.dadgpt.com']]);
  });
});
