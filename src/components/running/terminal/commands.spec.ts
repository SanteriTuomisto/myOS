import { describe, expect, it, vi } from 'vitest';
import { runCommand, type CommandContext } from './commands';
import type { FileSystemItem } from '@/types';

const home = [{ id: -1, name: 'home' }];
const folder: FileSystemItem[] = [
  { id: 0, type: 'folder', name: 'My Computer', content: [] },
  { id: 1, type: 'browser', name: 'Browser' },
];

const context = (overrides: Partial<CommandContext> = {}): CommandContext => ({
  path: home,
  folder,
  openApplication: vi.fn(),
  ...overrides,
});

describe('runCommand', () => {
  it('lists commands with help', () => {
    expect(runCommand('help', context()).response).toBe('commands: ls, cd {0}, open {0}');
  });

  it('lists the folder with ls', () => {
    expect(runCommand('ls', context()).response).toBe('My Computer (folder), Browser (browser), ');
  });

  it('enters folders case-insensitively with cd', () => {
    expect(runCommand('cd my computer', context())).toEqual({
      response: '',
      path: [...home, { id: 0, name: 'My Computer' }],
    });
  });

  it('refuses to cd into missing folders or files', () => {
    expect(runCommand('cd browser', context())).toEqual({ response: 'No such folder', path: home });
    expect(runCommand('cd', context())).toEqual({ response: 'No such folder', path: home });
  });

  it('goes up with cd .., but not above home', () => {
    const path = [...home, { id: 0, name: 'My Computer' }];

    expect(runCommand('cd ..', context({ path })).path).toEqual(home);
    expect(runCommand('cd ..', context()).path).toBe(home);
  });

  it('opens items, opening folders in the file explorer', () => {
    const ctx = context();

    expect(runCommand('open BROWSER', ctx).response).toBe('');
    runCommand('open my computer', ctx);

    expect(ctx.openApplication).toHaveBeenNthCalledWith(1, { name: 'Browser', type: 'browser', fileSystemId: 1 });
    expect(ctx.openApplication).toHaveBeenNthCalledWith(2, { name: 'My Computer', type: 'fileExplorer', fileSystemId: 0 });
  });

  it('reports missing items for open', () => {
    const ctx = context();

    expect(runCommand('open nope', ctx).response).toBe('No such file or program');
    expect(ctx.openApplication).not.toHaveBeenCalled();
  });

  it('reports unknown commands', () => {
    expect(runCommand('rm -rf', context()).response).toBe('Unknown command: rm, try help');
  });
});
