import { ActionContext } from 'vuex';

type ApplicationType = 'monsterSlayer' | 'file' | 'fileExplorer' | 'browser' | 'recycleBin' | 'musicPlayer' | 'terminal' | 'settings';

interface Position {
  top: number;
  left: number;
}

interface Size {
  width: number;
  height: number;
}

export interface Application {
  id: number;
  name: string;
  type: ApplicationType;
  position: Position;
  minimized: boolean;
  maximized: boolean;
  size: Size;
  fileSystemId?: number;
}

interface State {
  id: number;
  applications: Array<Application>;
  activeWindowId: number | null;
  windowSize: { [key: string]: Size }
}

const state: State = {
  id: 0,
  applications: [],
  activeWindowId: null,
  windowSize: {},
};

const mutations = {
  increaseIdMutation(state: State) {
    state.id = state.id + 1;
  },
  openApplicationMutation(state: State, application: Application) {
    state.applications.push(application);
  },
  updateApplicationMutation(state: State, application: Application) {
    const index = state.applications.findIndex((app) => app.id === application.id);
    if (index >= 0) {
      const updatedApp = { 
        ...state.applications[index],
        ...application,
      };
      state.applications[index] = updatedApp;
    }
  },
  closeApplicationMutation(state: State, id: number) {
    state.applications = state.applications.filter(app => app.id !== id); 
  },
  setActiveWindowIdMutation(state: State, id: number | null) {
    state.activeWindowId = id;
  },
  saveWindowSizeMutation(state: State, { type, size }: { type: ApplicationType, size: Size }) {
    state.windowSize[type] = size;
  },
};

const actions = {
  openApplication(context: ActionContext<State, any>, application: Application) {
    const nextId = context.state.id;
    const app = {
      ...application,
    };
    app.id = nextId;
    context.commit('increaseIdMutation');
    context.commit('setActiveWindowIdMutation', nextId);
    context.commit('openApplicationMutation', app);
  },
  updateApplication(context: ActionContext<State, any>, application: Application) {
    context.commit('updateApplicationMutation', application);
    context.commit('saveWindowSizeMutation', { type: application.type, size: application.size });
  },
  closeApplication(context: ActionContext<State, any>, id: number) {
    context.commit('closeApplicationMutation', id);
    context.dispatch('selectOtherActiveWindow');
  },
  setActiveWindowId(context: ActionContext<State, any>, id: number) {
    context.commit('setActiveWindowIdMutation', id);
    context.commit('updateApplicationMutation', {
      id: id,
      minimized: false,
    });
  },
  selectOtherActiveWindow(context: ActionContext<State, any>) {
    const visibleApp = [...context.state.applications].reverse().find(app => app.minimized === false);
    context.commit('setActiveWindowIdMutation', visibleApp ? visibleApp.id : null);
  },
};

const getters = {
  getApplications(state: State): Application[] {
    return state.applications;
  },
  getActiveWindowId(state: State): number | null {
    return state.activeWindowId;
  },
  getApplicationById: (state: State) => (id: number): Application | undefined => {
    return state.applications.find(app => app.id === id);
  },
  getWindowSize: (state: State) => (type: string): Size => {
    return state.windowSize[type] || { width: 500, height: 350 };
  },
};

export default {
  state,
  mutations,
  actions,
  getters,
};