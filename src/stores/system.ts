import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSystemStore = defineStore('system', () => {
  const version = __APP_VERSION__;
  const powerOn = ref(false);
  const startup = ref(false);
  const showStartMenu = ref(false);

  function togglePower() {
    if (powerOn.value) {
      powerOn.value = false;
    } else {
      powerOn.value = true;
      toggleStartup();
    }
  }

  function toggleStartup() {
    startup.value = !startup.value;
  }

  function toggleStartMenu() {
    showStartMenu.value = !showStartMenu.value;
  }

  return { version, powerOn, startup, showStartMenu, togglePower, toggleStartup, toggleStartMenu };
}, {
  persist: { pick: ['powerOn', 'startup'] },
});
