import { describe, expect, it } from 'vitest';
import { apps, appTypes, getApp, isAppType, type AppDefinition } from '@/apps/registry';

describe('app registry', () => {
  it.each(appTypes)('%s has a name, an icon and sizes that fit', (type) => {
    const app: AppDefinition = apps[type];

    expect(app.name).not.toBe('');
    expect(app.icon).toBeDefined();
    expect(app.defaultSize.width).toBeGreaterThanOrEqual(app.minSize.width);
    expect(app.defaultSize.height).toBeGreaterThanOrEqual(app.minSize.height);
  });

  it('has external apps for the synth and the excavator', () => {
    expect(apps.synth).toMatchObject({ kind: 'external', name: 'Synth' });
    expect(apps.excavator).toMatchObject({ kind: 'external', name: 'Excavator' });
  });

  it('gives external apps an absolute http(s) url', () => {
    const external = Object.values(apps).filter((app) => app.kind === 'external');

    external.forEach((app) => expect(new URL(app.url).protocol).toMatch(/^https?:$/));
  });

  it('gives props to the apps that need the open application', () => {
    const app = { id: 3, name: 'Text', type: 'file' as const, fileSystemId: 4, minimized: false, maximized: false };

    expect(apps.file.props(app)).toEqual({ id: 3, fileSystemId: 4 });
    expect(apps.fileExplorer.props(app)).toEqual({ fileSystemId: 4 });
  });

  it('looks apps up by id, and returns undefined for unknown ids', () => {
    expect(getApp('terminal')).toBe(apps.terminal);
    expect(getApp('removedApp')).toBeUndefined();
    expect(getApp('toString')).toBeUndefined();
    expect(isAppType('synth')).toBe(true);
    expect(isAppType('folder')).toBe(false);
  });
});
