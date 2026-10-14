import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

import App from './App.vue';
import { resetStorageOnVersionChange, storageKey } from './stores/persistence';

resetStorageOnVersionChange(localStorage, __APP_VERSION__);

const pinia = createPinia();
pinia.use(createPersistedState({ key: storageKey }));

createApp(App).use(pinia).mount('#app');
