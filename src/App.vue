<template>
  <div v-if="!shutDownState">
    <ShutDown />
  </div>
  <div v-else-if="startupState">
    <Startup />
  </div>
  <div v-else class="os">
    <Desktop />
    <Taskbar />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import Desktop from './components/running/desktop/Desktop.vue';
import Startup from './components/boot/Startup.vue';
import ShutDown from './components/shutDown/ShutDown.vue';
import Taskbar from './components/running/taskBar/Taskbar.vue';
import { useSystemStore } from '@/stores/system';

const { powerOn, startup } = storeToRefs(useSystemStore());

// In development, skip straight to the desktop
const shutDownState = computed(() => import.meta.env.DEV || powerOn.value);
const startupState = computed(() => !import.meta.env.DEV && startup.value);
</script>

<style>
/* Used to come in globally via the PrimeVue theme; the layouts rely on it */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  overflow: hidden;
  overscroll-behavior: none;
}

/* Fixed to the visible viewport, so mobile browser bars can't push the taskbar off screen */
.os {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: clip;
}

#app {
  margin: 0px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
