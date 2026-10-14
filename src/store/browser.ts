export interface NetworkItem {
  name: string;
  url: string;
}

export const boogle: NetworkItem = {
  name: 'Boogle',
  url: 'www.boogle.com',
};
export const empty: NetworkItem = {
  name: '404',
  url: 'not found',
};
const bacefook: NetworkItem = {
  name: 'Bacefook',
  url: 'www.bacefook.com',
};
const dadGpt: NetworkItem = {
  name: 'DadGPT',
  url: 'www.dadgpt.com',
};
const myOs: NetworkItem = {
  name: 'myOs',
  url: 'www.myos.com',
};

interface State {
  network: NetworkItem[];
}

const state: State = {
  network: [
    boogle,
    empty,
    bacefook,
    dadGpt,
    myOs,
  ]
}

const getters = {
  getNetwork(state: State): NetworkItem[] {
    return state.network;
  },
};

export default {
  state,
  getters,
};
