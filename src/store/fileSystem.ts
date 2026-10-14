import { ActionContext } from 'vuex';

export type ApplicationType = 'file' | 'folder' | 'browser' | 'musicPlayer' | 'terminal' | 'settings' | 'fileExplorer' | 'recycleBin' | 'monsterSlayer';

export interface Item {
  id: number;
  type: ApplicationType;
  name: string;
  content?: Array<Item>;
}

interface State {
  nextFileId: number;
  fileSystemItems: Array<Item>;
  fileData: { id: number; data: string }[];
}

const state: State = {
  nextFileId: 21,
  fileSystemItems: [
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
            {
              id: 5,
              type: 'file',
              name: 'Text',
            }
          ],
        },
        {
          id: 4,
          type: 'file',
          name: 'Text',
        },
      ],
    },
    {
      id: 6,
      type: 'folder',
      name: 'Start Menu',
      content: [
        {
          id: 7,
          type: 'browser',
          name: 'Browser',
        },
        {
          id: 8,
          type: 'musicPlayer',
          name: 'Music',
        },
        {
          id: 9,
          type: 'fileExplorer',
          name: 'Files',
        },
        {
          id: 10,
          type: 'terminal',
          name: 'Terminal',
        },
        {
          id: 11,
          type: 'settings',
          name: 'Settings',
        },
      ],
    },
    {
      id: 12,
      type: 'folder',
      name: 'Desktop',
      content: [
        {
          id: 13,
          type: 'recycleBin',
          name: 'Recycle Bin',
        },
        {
          id: 14,
          type: 'browser',
          name: 'Browser',
        },
        {
          id: 15,
          type: 'musicPlayer',
          name: 'Music',
        },
        {
          id: 16,
          type: 'fileExplorer',
          name: 'Files',
        },
        {
          id: 17,
          type: 'terminal',
          name: 'Terminal',
        },
        {
          id: 18,
          type: 'settings',
          name: 'Settings',
        },
        {
          id: 19,
          type: 'monsterSlayer',
          name: 'Monster Slayer',
        },
      ],
    },
    {
      id: 1,
      type: 'browser',
      name: 'Browser',
    },
    {
      id: 2,
      type: 'musicPlayer',
      name: 'Music',
    },
    {
      id: 20,
      type: 'terminal',
      name: 'Terminal',
    },
  ],
  fileData: [],
};

const mutations = {
  increaseNextFileIdMut(state: State) {
    state.nextFileId = state.nextFileId + 1;
  },
  addNewFileMut(state: State, data: { newItem: Item, currentPath: Item[] }) {
    const currentPath = data.currentPath;
    const items = state.fileSystemItems;
    // Add to root
    if (currentPath.length === 1 && currentPath[0].id === -1) {
      items.push(data.newItem);
      return;
    }
    // Find correct node
    let loopItem = null;
    for (let i = 0; i < currentPath.length; i += 1) {
      const cp = currentPath[i];
      if (loopItem?.content != null) {
        loopItem = loopItem.content.find((i: Item) => i.id === cp.id);        
      } else {
        loopItem = items.find((i) => i.id === cp.id);        
      }
    }
    if (loopItem?.content == null) {
      return;
    }
    loopItem.content.push(data.newItem);
  },
  deleteFileMut(state: State, { id, currentPath }: { id: number; currentPath: Item[] }) {
    const items = state.fileSystemItems;
    // Todo delete also file content
    if (currentPath.length === 1 && currentPath[0].id === -1) {
      const index = items.findIndex(i => i.id === id);
      if (index !== -1) {
        items.splice(index, 1);
      }
      return;
    }
    // Find correct node
    let loopItem = null;
    for (let i = 0; i < currentPath.length; i += 1) {
      const cp = currentPath[i];
      if (loopItem?.content != null) {
        loopItem = loopItem.content.find((i: Item) => i.id === cp.id);        
      } else {
        loopItem = items.find((i) => i.id === cp.id);        
      }
    }
    if (loopItem?.content == null) {
      return;
    }
    const index = loopItem.content.findIndex(i => i.id === id);
    if (index !== -1) {
      loopItem.content.splice(index, 1);
    }
  },
  saveFileContentMut(state: State, data: { id: number, text: string }) {
    const index = state.fileData.findIndex(i => i.id === data.id);
    if (index === -1) {
      state.fileData.push({ id: data.id, data: data.text });
    } else {
      state.fileData[index] = { ...state.fileData[index], data: data.text };
    }
  },
};
const actions = {
  addNewFile(context: ActionContext<State, any>, data: { item: Item, currentPath: Item[] }) {
    const newItem = data.item;
    newItem.id = context.state.nextFileId;
    if (newItem.type === 'folder') {
      newItem.content = [];
    }
    context.commit('increaseNextFileIdMut');
    context.commit('addNewFileMut', { currentPath: data.currentPath, newItem });
  },
  saveFileContent(context: ActionContext<State, any>, data: { id: number, text: string }) {
    context.commit('saveFileContentMut', data);
  },
  deleteFile(context: ActionContext<State, any>, { id, currentPath }: { id: number; currentPath: Item[] }) {
    context.commit('deleteFileMut', { id, currentPath });
  },
};
const getters = {
  getFileSystemItems(state: State) {
    return state.fileSystemItems;
  },
  getItem: (state: State) => (id: number) => {
    return state.fileData.find(i => i.id === id);
  },
};

export default {
  state,
  mutations,
  actions,
  getters,
};