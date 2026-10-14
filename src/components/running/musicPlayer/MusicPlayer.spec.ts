import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import MusicPlayer, { type Song } from './MusicPlayer.vue';

class FakeAudio {
  static instances: FakeAudio[] = [];
  paused = true;
  src: string;
  play = vi.fn(() => {
    this.paused = false;
    return Promise.resolve();
  });
  pause = vi.fn(() => {
    this.paused = true;
  });

  constructor(src: string) {
    this.src = src;
    FakeAudio.instances.push(this);
  }
}

const songs: Song[] = [
  { artist: 'Artist A', name: 'Song A', filename: 'a.mp3', length: '3:00' },
  { artist: 'Artist B', name: 'Song B', filename: 'b.mp3', length: '2:30' },
];

describe('MusicPlayer', () => {
  beforeEach(() => {
    FakeAudio.instances = [];
    vi.stubGlobal('Audio', FakeAudio);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const playButton = (wrapper: ReturnType<typeof mount>) => wrapper.find('.tools > div:nth-child(2)');

  it('lists the songs and has play disabled until one is selected', async () => {
    const wrapper = mount(MusicPlayer, { props: { songs } });

    expect(wrapper.findAll('.song').map((s) => s.findAll('div').map((d) => d.text()))).toEqual([
      ['Song A', 'Artist A', '3:00'],
      ['Song B', 'Artist B', '2:30'],
    ]);
    expect(playButton(wrapper).classes()).toEqual(['play-button-disabled']);

    await playButton(wrapper).trigger('click');
    expect(FakeAudio.instances).toHaveLength(0);
  });

  it('has no songs by default', () => {
    const wrapper = mount(MusicPlayer);

    expect(wrapper.findAll('.song')).toHaveLength(0);
  });

  it('selecting a song loads it and shows it as now playing', async () => {
    const wrapper = mount(MusicPlayer, { props: { songs } });

    await wrapper.findAll('.song')[1].trigger('click');

    expect(FakeAudio.instances).toHaveLength(1);
    // Vite resolves the URL from src/assets/music at build time (the folder is empty today)
    expect(typeof FakeAudio.instances[0].src).toBe('string');
    expect(wrapper.findAll('.np-text div').map((d) => d.text())).toEqual(['Artist B', '-', 'Song B']);
    expect(playButton(wrapper).classes()).toEqual(['play-button']);
  });

  it('play toggles between playing and paused', async () => {
    const wrapper = mount(MusicPlayer, { props: { songs } });
    await wrapper.findAll('.song')[0].trigger('click');
    const audio = FakeAudio.instances[0];

    await playButton(wrapper).trigger('click');
    expect(audio.play).toHaveBeenCalledOnce();
    expect(playButton(wrapper).classes()).toEqual(['play-button-playing']);

    await playButton(wrapper).trigger('click');
    expect(audio.pause).toHaveBeenCalledOnce();
    expect(playButton(wrapper).classes()).toEqual(['play-button']);
  });

  it('selecting another song stops the playing one', async () => {
    const wrapper = mount(MusicPlayer, { props: { songs } });
    await wrapper.findAll('.song')[0].trigger('click');
    await playButton(wrapper).trigger('click');
    const first = FakeAudio.instances[0];

    await wrapper.findAll('.song')[1].trigger('click');

    expect(first.pause).toHaveBeenCalledOnce();
    expect(FakeAudio.instances).toHaveLength(2);
    expect(playButton(wrapper).classes()).toEqual(['play-button']);
  });
});
