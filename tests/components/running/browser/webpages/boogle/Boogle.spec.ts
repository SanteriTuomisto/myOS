import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Boogle from '@/components/running/browser/webpages/boogle/Boogle.vue';
import BoogleLogo from '@/components/running/browser/webpages/boogle/BoogleLogo.vue';

describe('Boogle', () => {
  it('shows the logo and an empty search box', () => {
    const wrapper = mount(Boogle);
    expect(wrapper.findComponent(BoogleLogo).text().replace(/\s/g, '')).toBe('Boogle');
    expect(wrapper.find('.results').exists()).toBe(false);
  });

  it('shows results for a search with the button', async () => {
    const wrapper = mount(Boogle);
    await wrapper.find('input').setValue('cats');
    await wrapper.find('button').trigger('click');

    expect(wrapper.find('.results').text()).toContain('Your search - cats - did not match any documents.');
  });

  it('searches on Enter and from the results page', async () => {
    const wrapper = mount(Boogle);
    await wrapper.find('input').setValue('cats');
    await wrapper.find('input').trigger('keyup', { key: 'Enter' });
    expect(wrapper.find('.results').text()).toContain('- cats -');

    await wrapper.find('input').setValue('dogs');
    await wrapper.find('input').trigger('keyup', { key: 'Enter' });
    expect(wrapper.find('.results').text()).toContain('- dogs -');
  });

  it('clears the results when searching for nothing', async () => {
    const wrapper = mount(Boogle);
    await wrapper.find('input').setValue('cats');
    await wrapper.find('button').trigger('click');

    await wrapper.find('input').setValue('');
    await wrapper.find('button').trigger('click');

    expect(wrapper.find('.results').exists()).toBe(false);
    expect(wrapper.find('.search-page').exists()).toBe(false);
  });
});
