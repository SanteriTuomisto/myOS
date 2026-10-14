import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { FileSystemItem, ItemType, PathItem, RecycledItem } from '@/types';

export const ROOT_PATH: PathItem[] = [{ id: -1, name: 'home' }];
const DESKTOP_ID = 12;

/** Ids of an item and everything inside it. */
function collectIds(item: FileSystemItem): number[] {
  return [item.id, ...(item.content ?? []).flatMap(collectIds)];
}

const defaultItems = (): FileSystemItem[] => [
  {
    id: 0,
    type: 'folder',
    name: 'My Computer',
    protected: true,
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
    protected: true,
    content: [
      { id: 7, type: 'browser', name: 'Browser' },
      { id: 8, type: 'musicPlayer', name: 'Music' },
      { id: 9, type: 'fileExplorer', name: 'Files' },
      { id: 10, type: 'terminal', name: 'Terminal' },
      { id: 11, type: 'settings', name: 'Settings' },
      { id: 21, type: 'synth', name: 'Synth' },
      { id: 22, type: 'excavator', name: 'Excavator' },
    ],
  },
  {
    id: 12,
    type: 'folder',
    name: 'Desktop',
    protected: true,
    content: [
      { id: 13, type: 'recycleBin', name: 'Recycle Bin', protected: true },
      { id: 14, type: 'browser', name: 'Browser' },
      { id: 15, type: 'musicPlayer', name: 'Music' },
      { id: 16, type: 'fileExplorer', name: 'Files' },
      { id: 17, type: 'terminal', name: 'Terminal' },
      { id: 18, type: 'settings', name: 'Settings' },
      { id: 19, type: 'monsterSlayer', name: 'Monster Slayer' },
      { id: 23, type: 'synth', name: 'Synth' },
      { id: 24, type: 'excavator', name: 'Excavator' },
    ],
  },
  { id: 1, type: 'browser', name: 'Browser' },
  { id: 2, type: 'musicPlayer', name: 'Music' },
  { id: 20, type: 'terminal', name: 'Terminal' },
];

export const useFileSystemStore = defineStore('fileSystem', () => {
  const nextFileId = ref(25);
  const items = ref<FileSystemItem[]>(defaultItems());
  const fileData = ref<Record<number, string>>({});
  const recycleBin = ref<RecycledItem[]>([]);

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

  function isNameTaken(path: PathItem[], name: string, exceptId?: number): boolean {
    const lowerName = name.toLowerCase();
    return (getFolderContent(path) ?? []).some((item) => item.id !== exceptId && item.name.toLowerCase() === lowerName);
  }

  /** `name` if it's free in the folder, otherwise "name (2)", "name (3)", ... */
  function freeName(path: PathItem[], name: string): string {
    let candidate = name;
    let number = 2;
    while (isNameTaken(path, candidate)) {
      candidate = `${name} (${number})`;
      number += 1;
    }
    return candidate;
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

  /**
   * Renames an item. Returns an error message instead when the name is empty,
   * already used in the folder (ignoring case), or the item is a system item.
   */
  function renameItem(path: PathItem[], id: number, newName: string): string | undefined {
    const item = getFolderContent(path)?.find((candidate) => candidate.id === id);
    const name = newName.trim();
    if (!item) {
      return 'Item not found';
    }
    if (item.protected) {
      return `${item.name} can't be renamed`;
    }
    if (name === '') {
      return 'Name can\'t be empty';
    }
    if (isNameTaken(path, name, id)) {
      return `${name} already exists here`;
    }
    item.name = name;
    return undefined;
  }

  /** Moves an item (and everything in it) to the recycle bin. System items stay put. */
  function deleteItem(path: PathItem[], id: number) {
    const folder = getFolderContent(path);
    const index = folder?.findIndex((item) => item.id === id) ?? -1;
    if (!folder || index === -1 || folder[index].protected) {
      return;
    }
    const [item] = folder.splice(index, 1);
    const savedData: Record<number, string> = {};
    for (const fileId of collectIds(item)) {
      if (fileId in fileData.value) {
        savedData[fileId] = fileData.value[fileId];
        delete fileData.value[fileId];
      }
    }
    recycleBin.value.push({ item, originalPath: path.map((step) => ({ ...step })), fileData: savedData });
  }

  /** Puts an item back where it was deleted from, or on the Desktop if that folder is gone. */
  function restoreItem(id: number) {
    const index = recycleBin.value.findIndex((entry) => entry.item.id === id);
    if (index === -1) {
      return;
    }
    const [{ item, originalPath, fileData: savedData }] = recycleBin.value.splice(index, 1);
    const path = getFolderContent(originalPath) ? originalPath : findFolderPath(DESKTOP_ID) ?? ROOT_PATH;
    item.name = freeName(path, item.name);
    getFolderContent(path)?.push(item);
    Object.assign(fileData.value, savedData);
  }

  function restoreAll() {
    [...recycleBin.value].forEach((entry) => restoreItem(entry.item.id));
  }

  /** Deletes everything in the recycle bin for good. */
  function emptyRecycleBin() {
    recycleBin.value = [];
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
    recycleBin,
    getFolderContent,
    getTopLevelFolder,
    findFolderPath,
    uniqueName,
    addItem,
    renameItem,
    deleteItem,
    restoreItem,
    restoreAll,
    emptyRecycleBin,
    getFileContent,
    saveFileContent,
  };
}, {
  persist: true,
});
