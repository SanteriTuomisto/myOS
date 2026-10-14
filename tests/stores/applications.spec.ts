import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useApplicationsStore } from '@/stores/applications';

describe('applications store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('opens apps with increasing ids and makes the newest active', () => {
    const apps = useApplicationsStore();

    const first = apps.openApplication({ name: 'Browser', type: 'browser' });
    const second = apps.openApplication({ name: 'Files', type: 'fileExplorer', fileSystemId: 3 });

    expect(first.id).toBe(0);
    expect(second.id).toBe(1);
    expect(second.fileSystemId).toBe(3);
    expect(apps.applications).toHaveLength(2);
    expect(apps.activeWindowId).toBe(1);
  });

  it('updates an app and remembers the window size per app type', () => {
    const apps = useApplicationsStore();
    const app = apps.openApplication({ name: 'Browser', type: 'browser' });

    apps.updateApplication(app.id, { maximized: true, size: { width: 800, height: 600 } });

    expect(apps.getApplicationById(app.id)?.maximized).toBe(true);
    expect(apps.getWindowSize('browser')).toEqual({ width: 800, height: 600 });
    expect(apps.getWindowSize('terminal')).toEqual({ width: 500, height: 350 });
  });

  it('ignores updates to apps that are not open', () => {
    const apps = useApplicationsStore();

    apps.updateApplication(42, { maximized: true });

    expect(apps.applications).toEqual([]);
  });

  it('closing the active window activates the newest visible one', () => {
    const apps = useApplicationsStore();
    const first = apps.openApplication({ name: 'A', type: 'browser' });
    const second = apps.openApplication({ name: 'B', type: 'terminal' });
    const third = apps.openApplication({ name: 'C', type: 'settings' });
    apps.updateApplication(second.id, { minimized: true });

    apps.closeApplication(third.id);

    expect(apps.applications.map((app) => app.id)).toEqual([first.id, second.id]);
    expect(apps.activeWindowId).toBe(first.id);
  });

  it('has no active window when every remaining window is minimized', () => {
    const apps = useApplicationsStore();
    const first = apps.openApplication({ name: 'A', type: 'browser' });
    const second = apps.openApplication({ name: 'B', type: 'terminal' });
    apps.updateApplication(first.id, { minimized: true });

    apps.closeApplication(second.id);

    expect(apps.activeWindowId).toBeNull();
  });

  it('activating a minimized window restores it', () => {
    const apps = useApplicationsStore();
    const app = apps.openApplication({ name: 'A', type: 'browser' });
    apps.updateApplication(app.id, { minimized: true });

    apps.setActiveWindow(app.id);

    expect(apps.activeWindowId).toBe(app.id);
    expect(apps.getApplicationById(app.id)?.minimized).toBe(false);
  });

  it('can clear the active window', () => {
    const apps = useApplicationsStore();
    apps.openApplication({ name: 'A', type: 'browser' });

    apps.setActiveWindow(null);

    expect(apps.activeWindowId).toBeNull();
  });

  it('minimizing activates the newest other visible window', () => {
    const apps = useApplicationsStore();
    const first = apps.openApplication({ name: 'A', type: 'browser' });
    const second = apps.openApplication({ name: 'B', type: 'terminal' });

    apps.minimizeWindow(second.id);

    expect(apps.getApplicationById(second.id)?.minimized).toBe(true);
    expect(apps.activeWindowId).toBe(first.id);
  });

  describe('toggleWindow (taskbar click)', () => {
    it('minimizes the active window', () => {
      const apps = useApplicationsStore();
      const app = apps.openApplication({ name: 'A', type: 'browser' });

      apps.toggleWindow(app.id);

      expect(apps.getApplicationById(app.id)?.minimized).toBe(true);
      expect(apps.activeWindowId).toBeNull();
    });

    it('restores and activates a minimized window', () => {
      const apps = useApplicationsStore();
      const app = apps.openApplication({ name: 'A', type: 'browser' });
      apps.toggleWindow(app.id);

      apps.toggleWindow(app.id);

      expect(apps.getApplicationById(app.id)?.minimized).toBe(false);
      expect(apps.activeWindowId).toBe(app.id);
    });

    it('brings an inactive window to the front without minimizing it', () => {
      const apps = useApplicationsStore();
      const first = apps.openApplication({ name: 'A', type: 'browser' });
      apps.openApplication({ name: 'B', type: 'terminal' });

      apps.toggleWindow(first.id);

      expect(apps.getApplicationById(first.id)?.minimized).toBe(false);
      expect(apps.activeWindowId).toBe(first.id);
    });
  });

  describe('on small screens', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('opens windows maximized', () => {
      vi.stubGlobal('matchMedia', (query: string) => ({ matches: query === '(max-width: 767px)' }));
      const apps = useApplicationsStore();

      expect(apps.openApplication({ name: 'A', type: 'browser' }).maximized).toBe(true);
    });

    it('opens windows normally on wide screens', () => {
      vi.stubGlobal('matchMedia', () => ({ matches: false }));
      const apps = useApplicationsStore();

      expect(apps.openApplication({ name: 'A', type: 'browser' }).maximized).toBe(false);
    });
  });
});
