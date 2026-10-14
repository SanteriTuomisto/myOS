import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { FileSystemItem, ItemType, PathItem } from '@/types';

export const ROOT_PATH: PathItem[] = [{ id: -1, name: 'home' }];

const defaultItems = (): FileSystemItem[] => [
  {
    id: 0,
    type: 'folder',
    name: 'My Computer',
    content: [
      {
        id: 3,
        type: 'folder',
        name: 'Documents',
        content: [
          { id: 5, type: 'file', name: 'Text' },
        ],
      },
      { id: 4, type: 'file', name: 'Text' },
    ],
  },
  {
    id: 6,
    type: 'folder',
    name: 'Start Menu',
    content: [
      { id: 7, type: 'browser', name: 'Browser' },
      { id: 8, type: 'musicPlayer', name: 'Music' },
      { id: 9, type: 'fileExplorer', name: 'Files' },
      { id: 10, type: 'terminal', name: 'Terminal' },
      { id: 11, type: 'settings', name: 'Settings' },
    ],
  },
  {
    id: 12,
    type: 'folder',
    name: 'Desktop',
    content: [
      { id: 13, type: 'recycleBin', name: 'Recycle Bin' },
      { id: 14, type: 'browser', name: 'Browser' },
      { id: 15, type: 'musicPlayer', name: 'Music' },
      { id: 16, type: 'fileExplorer', name: 'Files' },
      { id: 17, type: 'terminal', name: 'Terminal' },
      { id: 18, type: 'settings', name: 'Settings' },
      { id: 19, type: 'monsterSlayer', name: 'Monster Slayer' },
    ],
  },
  { id: 1, type: 'browser', name: 'Browser' },
  { id: 2, type: 'musicPlayer', name: 'Music' },
  { id: 20, type: 'terminal', name: 'Terminal' },
];

export const useFileSystemStore = defineStore('fileSystem', () => {
  const nextFileId = ref(21);
  const items = ref<FileSystemItem[]>(defaultItems());
  const fileData = ref<Record<number, string>>({});

  /** Contents of the folder at the end of `path`, or undefined if the path no longer exists. */
  function getFolderContent(path: PathItem[]): FileSystemItem[] | undefined {
    let content: FileSystemItem[] | undefined = items.value;
    for (const step of path) {
      if (step.id === ROOT_PATH[0].id) {
        continue;
      }
      content = content?.find((item) => item.id === step.id && item.type === 'folder')?.content;
    }
    return content;
  }

  function getTopLevelFolder(name: string): FileSystemItem[] {
    return items.value.find((item) => item.type === 'folder' && item.name === name)?.content ?? [];
  }

  /** Path from the root to the folder with `id`, or undefined if there's no such folder. */
  function findFolderPath(id: number, content: FileSystemItem[] = items.value): PathItem[] | undefined {
    for (const item of content) {
      if (item.type !== 'folder') {
        continue;
      }
      const step = { id: item.id, name: item.name };
      if (item.id === id) {
        return [...ROOT_PATH, step];
      }
      const subPath = findFolderPath(id, item.content ?? []);
      if (subPath) {
        return [...ROOT_PATH, step, ...subPath.slice(ROOT_PATH.length)];
      }
    }
    return undefined;
  }

  /** "Name 1", "Name 2", ... whichever is the first free one in the folder. */
  function uniqueName(path: PathItem[], baseName: string): string {
    const names = new Set((getFolderContent(path) ?? []).map((item) => item.name.toLowerCase()));
    let number = 1;
    while (names.has(`${baseName} ${number}`.toLowerCase())) {
      number += 1;
    }
    return `${baseName} ${number}`;
  }

  function addItem(path: PathItem[], type: ItemType, name: string): FileSystemItem | undefined {
    const folder = getFolderContent(path);
    if (!folder) {
      return undefined;
    }
    const item: FileSystemItem = { id: nextFileId.value, type, name };
    if (type === 'folder') {
      item.content = [];
    }
    nextFileId.value += 1;
    folder.push(item);
    return item;
  }

  function deleteItem(path: PathItem[], id: number) {
    const folder = getFolderContent(path);
    const index = folder?.findIndex((item) => item.id === id) ?? -1;
    if (folder && index !== -1) {
      folder.splice(index, 1);
      delete fileData.value[id];
    }
  }

  function getFileContent(id: number): string | undefined {
    return fileData.value[id];
  }

  function saveFileContent(id: number, text: string) {
    fileData.value[id] = text;
  }

  return {
    nextFileId,
    items,
    fileData,
    getFolderContent,
    getTopLevelFolder,
    findFolderPath,
    uniqueName,
    addItem,
    deleteItem,
    getFileContent,
    saveFileContent,
  };
}, {
  persist: true,
});
