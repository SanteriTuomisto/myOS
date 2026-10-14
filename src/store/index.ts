import { createStore } from 'vuex';
import VuexPersistence from 'vuex-persist';
import browser from './browser';
import applications from './applications';
import fileSystem from './fileSystem';
import settings from './settings';

interface State {
  version: string | null;
  powerOn: boolean;
  startup: boolean;
  showStartMenu: boolean;
}

const state: State = {
  version: __APP_VERSION__,
  powerOn: false,
  startup: false,
  showStartMenu: false,
};

const PERSIST_KEY = 'myOs-persist-store';

// Drop persisted state from another version before it gets restored, so new defaults take effect
try {
  const saved = JSON.parse(localStorage.getItem(PERSIST_KEY) || 'null');
  if (saved && saved.version !== __APP_VERSION__) {
    localStorage.removeItem(PERSIST_KEY);
  }
} catch {
  localStorage.removeItem(PERSIST_KEY);
}

export const store = createStore({
  state,
  mutations: {
    setPowerMutation(state: State, powerStatus: boolean) {
      state.powerOn = powerStatus;
    },
    setStartupMutation(state: State) {
      state.startup = !state.startup;
    },
    setStartMenuMutation(state: State) {
      state.showStartMenu = !state.showStartMenu;
    },
  },
  actions: {
    toggleStartMenu({ commit }) {
      commit('setStartMenuMutation');
    },
    togglePower({ commit, dispatch, state }) {
      const currentState = state.powerOn;
      if (currentState) {
        commit('setPowerMutation', false);
      } else {
        commit('setPowerMutation', true);
        dispatch('toggleStartup');
      }
    },
    toggleStartup({ commit }) {
      commit('setStartupMutation');
    },
  },
  modules: {
    applications,
    fileSystem,
    browser,
    settings,
  },
  plugins: [new VuexPersistence({ key: PERSIST_KEY }).plugin],
});
