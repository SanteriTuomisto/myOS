import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useSystemStore } from '@/stores/system';

describe('system store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('starts powered off', () => {
    const system = useSystemStore();

    expect(system.powerOn).toBe(false);
    expect(system.startup).toBe(false);
    expect(system.version).toBe(__APP_VERSION__);
  });

  it('powering on also starts the startup screen', () => {
    const system = useSystemStore();

    system.togglePower();

    expect(system.powerOn).toBe(true);
    expect(system.startup).toBe(true);
  });

  it('powering off leaves startup alone', () => {
    const system = useSystemStore();
    system.togglePower();
    system.toggleStartup();

    system.togglePower();

    expect(system.powerOn).toBe(false);
    expect(system.startup).toBe(false);
  });

  it('toggles the start menu', () => {
    const system = useSystemStore();

    system.toggleStartMenu();
    expect(system.showStartMenu).toBe(true);
    system.toggleStartMenu();
    expect(system.showStartMenu).toBe(false);
  });
});
