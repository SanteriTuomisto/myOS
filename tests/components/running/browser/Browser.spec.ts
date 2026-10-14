import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Browser from '@/components/running/browser/Browser.vue';
import Boogle from '@/components/running/browser/webpages/boogle/Boogle.vue';
import Bacefook from '@/components/running/browser/webpages/Bacefook.vue';
import DadGpt from '@/components/running/browser/webpages/DadGpt.vue';
import myOs from '@/components/running/browser/webpages/myOs.vue';
import Empty from '@/components/running/browser/webpages/Empty.vue';
import ArrowLeft from '@/assets/ArrowLeft.vue';
import HomeIcon from '@/assets/HomeIcon.vue';
import Scroller from '@/components/_shared/Scroller.vue';

function mountBrowser() {
  // Stub the iframe page so the test never loads the real site
  return mount(Browser, { global: { stubs: { myOs: true } } });
}

type BrowserWrapper = ReturnType<typeof mountBrowser>;

async function goTo(wrapper: BrowserWrapper, url: string) {
  const input = wrapper.find('.browser-toolbar input');
  await input.setValue(url);
  await input.trigger('keyup', { key: 'Enter' });
}

function urlBar(wrapper: BrowserWrapper) {
  return (wrapper.find('.browser-toolbar input').element as HTMLInputElement).value;
}

describe('Browser', () => {
  it('starts on Boogle without a back button', () => {
    const wrapper = mountBrowser();
    expect(wrapper.findComponent(Boogle).exists()).toBe(true);
    expect(urlBar(wrapper)).toBe('www.boogle.com');
    expect(wrapper.findComponent(ArrowLeft).exists()).toBe(false);
  });

  it.each([
    ['www.bacefook.com', Bacefook],
    ['WWW.DADGPT.COM', DadGpt],
    ['www.boogle.com', Boogle],
  ])('navigates to %s from the URL bar on Enter', async (url, page) => {
    const wrapper = mountBrowser();
    await goTo(wrapper, url);
    expect(wrapper.findComponent(page).exists()).toBe(true);
    expect(urlBar(wrapper)).toBe(url.toLowerCase());
  });

  it('does not navigate on other keys', async () => {
    const wrapper = mountBrowser();
    const input = wrapper.find('.browser-toolbar input');
    await input.setValue('www.bacefook.com');
    await input.trigger('keyup', { key: 'a' });
    expect(wrapper.findComponent(Boogle).exists()).toBe(true);
  });

  it('turns off scrolling only for the myOs page', async () => {
    const wrapper = mountBrowser();
    expect(wrapper.findComponent(Scroller).props('scrollOn')).toBe(true);
    await goTo(wrapper, 'www.myos.com');
    expect(wrapper.findComponent(myOs).exists()).toBe(true);
    expect(wrapper.findComponent(Scroller).props('scrollOn')).toBe(false);
  });

  it('shows the 404 page for unknown urls, whose links navigate', async () => {
    const wrapper = mountBrowser();
    await goTo(wrapper, 'www.nope.com');

    const empty = wrapper.findComponent(Empty);
    expect(empty.exists()).toBe(true);
    expect(urlBar(wrapper)).toBe('not found');
    const links = empty.findAll('.link');
    expect(links.map((l) => l.text())).toEqual(['Boogle', 'Bacefook', 'DadGPT', 'myOs']);

    await links[1].trigger('click');
    expect(wrapper.findComponent(Bacefook).exists()).toBe(true);
    expect(urlBar(wrapper)).toBe('www.bacefook.com');
  });

  it('goes back through history', async () => {
    const wrapper = mountBrowser();
    await goTo(wrapper, 'www.bacefook.com');
    await goTo(wrapper, 'www.dadgpt.com');

    await wrapper.findComponent(ArrowLeft).trigger('click');
    expect(wrapper.findComponent(Bacefook).exists()).toBe(true);
    expect(urlBar(wrapper)).toBe('www.bacefook.com');

    await wrapper.findComponent(ArrowLeft).trigger('click');
    expect(wrapper.findComponent(Boogle).exists()).toBe(true);
    expect(wrapper.findComponent(ArrowLeft).exists()).toBe(false);
  });

  it('home returns to Boogle and resets history', async () => {
    const wrapper = mountBrowser();
    await goTo(wrapper, 'www.bacefook.com');
    await goTo(wrapper, 'www.dadgpt.com');

    await wrapper.findComponent(HomeIcon).trigger('click');
    expect(wrapper.findComponent(Boogle).exists()).toBe(true);
    expect(urlBar(wrapper)).toBe('www.boogle.com');
    expect(wrapper.findComponent(ArrowLeft).exists()).toBe(false);
  });

  it('keeps history separate per browser window', async () => {
    const first = mountBrowser();
    const second = mountBrowser();

    await goTo(first, 'www.bacefook.com');

    expect(first.findComponent(Bacefook).exists()).toBe(true);
    expect(second.findComponent(Boogle).exists()).toBe(true);
    expect(second.findComponent(ArrowLeft).exists()).toBe(false);
  });
});
