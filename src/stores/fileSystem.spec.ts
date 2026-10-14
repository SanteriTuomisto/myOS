import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { ROOT_PATH, useFileSystemStore } from './fileSystem';
import type { FileSystemItem } from '@/types';

const allIds = (items: FileSystemItem[]): number[] =>
  items.flatMap((item) => [item.id, ...allIds(item.content ?? [])]);

describe('fileSystem store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('has unique ids, all below nextFileId', () => {
    const fs = useFileSystemStore();
    const ids = allIds(fs.items);

    expect(new Set(ids).size).toBe(ids.length);
    expect(Math.max(...ids)).toBeLessThan(fs.nextFileId);
  });

  it('resolves folder contents by path', () => {
    const fs = useFileSystemStore();

    expect(fs.getFolderContent(ROOT_PATH)).toBe(fs.items);
    expect(fs.getFolderContent([...ROOT_PATH, { id: 0, name: 'My Computer' }, { id: 3, name: 'Documents' }])
      ?.map((item) => item.id)).toEqual([5]);
  });

  it('returns undefined for paths that no longer exist or go through a file', () => {
    const fs = useFileSystemStore();

    expect(fs.getFolderContent([...ROOT_PATH, { id: 999, name: 'Gone' }])).toBeUndefined();
    expect(fs.getFolderContent([...ROOT_PATH, { id: 1, name: 'Browser' }])).toBeUndefined();
  });

  it('gets top-level folders by name', () => {
    const fs = useFileSystemStore();

    expect(fs.getTopLevelFolder('Desktop').map((item) => item.name)).toContain('Recycle Bin');
    expect(fs.getTopLevelFolder('Nope')).toEqual([]);
  });

  it('finds the path to a nested folder', () => {
    const fs = useFileSystemStore();

    expect(fs.findFolderPath(3)).toEqual([...ROOT_PATH, { id: 0, name: 'My Computer' }, { id: 3, name: 'Documents' }]);
    expect(fs.findFolderPath(12)).toEqual([...ROOT_PATH, { id: 12, name: 'Desktop' }]);
  });

  it('finds no path for files or missing ids', () => {
    const fs = useFileSystemStore();

    expect(fs.findFolderPath(5)).toBeUndefined();
    expect(fs.findFolderPath(999)).toBeUndefined();
  });

  it('adds folders and files with fresh ids', () => {
    const fs = useFileSystemStore();
    const desktop = fs.findFolderPath(12)!;

    const folder = fs.addItem(desktop, 'folder', 'Folder 1');
    const file = fs.addItem([...desktop, { id: folder!.id, name: 'Folder 1' }], 'file', 'Text 1');

    expect(folder).toMatchObject({ id: 21, type: 'folder', content: [file] });
    expect(file).toMatchObject({ id: 22, type: 'file', name: 'Text 1' });
    expect(file).not.toHaveProperty('content');
    expect(fs.getTopLevelFolder('Desktop')).toContainEqual(folder);
  });

  it('adds to the root', () => {
    const fs = useFileSystemStore();

    const item = fs.addItem(ROOT_PATH, 'file', 'Notes');

    expect(fs.items).toContainEqual(item);
  });

  it('does not add to a missing folder', () => {
    const fs = useFileSystemStore();

    expect(fs.addItem([...ROOT_PATH, { id: 999, name: 'Gone' }], 'file', 'Text')).toBeUndefined();
    expect(fs.nextFileId).toBe(21);
  });

  it('picks the first free numbered name, ignoring case', () => {
    const fs = useFileSystemStore();
    const desktop = fs.findFolderPath(12)!;

    expect(fs.uniqueName(desktop, 'Folder')).toBe('Folder 1');
    fs.addItem(desktop, 'folder', 'folder 1');
    fs.addItem(desktop, 'folder', 'Folder 3');
    expect(fs.uniqueName(desktop, 'Folder')).toBe('Folder 2');
  });

  it('deletes an item and its saved content', () => {
    const fs = useFileSystemStore();
    const documents = fs.findFolderPath(3)!;
    fs.saveFileContent(5, '<p>hi</p>');

    fs.deleteItem(documents, 5);

    expect(fs.getFolderContent(documents)).toEqual([]);
    expect(fs.getFileContent(5)).toBeUndefined();
  });

  it('deleting a missing id leaves the folder untouched', () => {
    const fs = useFileSystemStore();
    const before = fs.items.length;

    fs.deleteItem(ROOT_PATH, 999);

    expect(fs.items).toHaveLength(before);
  });

  it('saves and reads file content', () => {
    const fs = useFileSystemStore();

    fs.saveFileContent(4, 'first');
    fs.saveFileContent(4, 'second');

    expect(fs.getFileContent(4)).toBe('second');
  });
});
