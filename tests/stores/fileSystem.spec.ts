import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { ROOT_PATH, useFileSystemStore } from '@/stores/fileSystem';
import type { FileSystemItem } from '@/types';
import { isAppType } from '@/apps/registry';

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

  it('only holds folders and app ids from the registry', () => {
    const fs = useFileSystemStore();
    const types = (items: FileSystemItem[]): string[] =>
      items.flatMap((item) => [item.type, ...types(item.content ?? [])]);

    types(fs.items).forEach((type) => expect(type === 'folder' || isAppType(type), type).toBe(true));
  });

  it('has the external apps on the desktop and in the start menu', () => {
    const fs = useFileSystemStore();

    for (const folder of ['Desktop', 'Start Menu']) {
      const types = fs.getTopLevelFolder(folder).map((item) => item.type);
      expect(types).toEqual(expect.arrayContaining(['synth', 'excavator']));
    }
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

    expect(folder).toMatchObject({ id: 25, type: 'folder', content: [file] });
    expect(file).toMatchObject({ id: 26, type: 'file', name: 'Text 1' });
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
    expect(fs.nextFileId).toBe(25);
  });

  it('picks the first free numbered name, ignoring case', () => {
    const fs = useFileSystemStore();
    const desktop = fs.findFolderPath(12)!;

    expect(fs.uniqueName(desktop, 'Folder')).toBe('Folder 1');
    fs.addItem(desktop, 'folder', 'folder 1');
    fs.addItem(desktop, 'folder', 'Folder 3');
    expect(fs.uniqueName(desktop, 'Folder')).toBe('Folder 2');
  });

  it('deleting moves an item and its saved content to the recycle bin', () => {
    const fs = useFileSystemStore();
    const documents = fs.findFolderPath(3)!;
    fs.saveFileContent(5, '<p>hi</p>');

    fs.deleteItem(documents, 5);

    expect(fs.getFolderContent(documents)).toEqual([]);
    expect(fs.getFileContent(5)).toBeUndefined();
    expect(fs.recycleBin).toEqual([
      { item: { id: 5, type: 'file', name: 'Text' }, originalPath: documents, fileData: { 5: '<p>hi</p>' } },
    ]);
  });

  it('deleting a folder takes the saved content of everything inside it', () => {
    const fs = useFileSystemStore();
    const myComputer = fs.findFolderPath(0)!;
    fs.saveFileContent(5, 'nested');
    fs.saveFileContent(4, 'sibling');

    fs.deleteItem(myComputer, 3);

    expect(fs.recycleBin[0].fileData).toEqual({ 5: 'nested' });
    expect(fs.getFileContent(4)).toBe('sibling');
  });

  it('never deletes system items', () => {
    const fs = useFileSystemStore();
    const desktop = fs.findFolderPath(12)!;

    for (const id of [0, 6, 12]) {
      fs.deleteItem(ROOT_PATH, id);
    }
    fs.deleteItem(desktop, 13);

    expect(fs.items.map((item) => item.id)).toEqual(expect.arrayContaining([0, 6, 12]));
    expect(fs.getTopLevelFolder('Desktop').map((item) => item.id)).toContain(13);
    expect(fs.recycleBin).toEqual([]);
  });

  it('restores an item and its content to where it was deleted from', () => {
    const fs = useFileSystemStore();
    const documents = fs.findFolderPath(3)!;
    fs.saveFileContent(5, 'back again');
    fs.deleteItem(documents, 5);

    fs.restoreItem(5);

    expect(fs.getFolderContent(documents)?.map((item) => item.id)).toEqual([5]);
    expect(fs.getFileContent(5)).toBe('back again');
    expect(fs.recycleBin).toEqual([]);
  });

  it('restores to the Desktop when the original folder is gone', () => {
    const fs = useFileSystemStore();
    const documents = fs.findFolderPath(3)!;
    fs.deleteItem(documents, 5);
    fs.deleteItem(fs.findFolderPath(0)!, 3);
    fs.emptyRecycleBin();
    const folder = fs.addItem(ROOT_PATH, 'folder', 'Temp')!;
    const tempPath = [...ROOT_PATH, { id: folder.id, name: 'Temp' }];
    fs.addItem(tempPath, 'file', 'Note');
    const note = fs.getFolderContent(tempPath)![0];
    fs.deleteItem(tempPath, note.id);
    fs.deleteItem(ROOT_PATH, folder.id);

    fs.restoreItem(note.id);

    expect(fs.getTopLevelFolder('Desktop').map((item) => item.name)).toContain('Note');
  });

  it('gives a restored item a free name if the old one was taken meanwhile', () => {
    const fs = useFileSystemStore();
    const documents = fs.findFolderPath(3)!;
    fs.deleteItem(documents, 5);
    fs.addItem(documents, 'file', 'text');

    fs.restoreItem(5);

    expect(fs.getFolderContent(documents)?.map((item) => item.name)).toEqual(['text', 'Text (2)']);
  });

  it('restores everything at once', () => {
    const fs = useFileSystemStore();
    const myComputer = fs.findFolderPath(0)!;
    fs.deleteItem(myComputer, 4);
    fs.deleteItem(myComputer, 3);

    fs.restoreAll();

    expect(fs.getFolderContent(myComputer)?.map((item) => item.id).sort()).toEqual([3, 4]);
    expect(fs.recycleBin).toEqual([]);
  });

  it('emptying the recycle bin deletes for good', () => {
    const fs = useFileSystemStore();
    fs.saveFileContent(4, 'gone');
    fs.deleteItem(fs.findFolderPath(0)!, 4);

    fs.emptyRecycleBin();
    fs.restoreItem(4);

    expect(fs.recycleBin).toEqual([]);
    expect(fs.getFileContent(4)).toBeUndefined();
  });

  it('renames items, trimming the name', () => {
    const fs = useFileSystemStore();
    const myComputer = fs.findFolderPath(0)!;

    expect(fs.renameItem(myComputer, 4, '  Notes  ')).toBeUndefined();

    expect(fs.getFolderContent(myComputer)?.find((item) => item.id === 4)?.name).toBe('Notes');
  });

  it('allows changing only the case of a name', () => {
    const fs = useFileSystemStore();
    const myComputer = fs.findFolderPath(0)!;

    expect(fs.renameItem(myComputer, 4, 'TEXT')).toBeUndefined();
  });

  it('refuses empty, duplicate and system item names', () => {
    const fs = useFileSystemStore();
    const myComputer = fs.findFolderPath(0)!;

    expect(fs.renameItem(myComputer, 4, '   ')).toBe('Name can\'t be empty');
    expect(fs.renameItem(myComputer, 4, 'documents')).toBe('documents already exists here');
    expect(fs.renameItem(ROOT_PATH, 12, 'Stuff')).toBe('Desktop can\'t be renamed');
    expect(fs.renameItem(ROOT_PATH, 999, 'Stuff')).toBe('Item not found');
    expect(fs.getFolderContent(myComputer)?.find((item) => item.id === 4)?.name).toBe('Text');
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
