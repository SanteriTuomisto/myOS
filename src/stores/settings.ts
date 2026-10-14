import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  const background = ref('green');

  function setBackground(value: string) {
    background.value = value;
  }

  return { background, setBackground };
}, {
  persist: true,
});
