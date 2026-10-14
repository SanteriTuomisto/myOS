import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ExternalApp from '@/components/running/desktop/ExternalApp.vue';

describe('ExternalApp', () => {
  const mountApp = (interactive?: boolean) => mount(ExternalApp, {
    props: { url: 'https://example.com/synth/', name: 'Synth', interactive },
  });

  it('shows the url in an iframe that may autoplay and go fullscreen', () => {
    const iframe = mountApp().find('iframe');

    expect(iframe.attributes('src')).toBe('https://example.com/synth/');
    expect(iframe.attributes('title')).toBe('Synth');
    expect(iframe.attributes('allow')).toContain('autoplay');
    expect(iframe.attributes('allow')).toContain('fullscreen');
    expect(iframe.attributes()).toHaveProperty('allowfullscreen');
    // A sandbox would block scripts, WebGL and Web Audio
    expect(iframe.attributes()).not.toHaveProperty('sandbox');
  });

  it('shows a loading text until the page has loaded', async () => {
    const wrapper = mountApp();
    expect(wrapper.find('.loading').text()).toBe('Loading Synth...');

    await wrapper.find('iframe').trigger('load');

    expect(wrapper.find('.loading').exists()).toBe(false);
  });

  it('lets mouse events through to the iframe only while interactive', async () => {
    const wrapper = mountApp();
    expect(wrapper.find('iframe').classes()).not.toContain('no-pointer');

    await wrapper.setProps({ interactive: false });

    expect(wrapper.find('iframe').classes()).toContain('no-pointer');
  });
});
