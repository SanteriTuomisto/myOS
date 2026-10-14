<template>
  <div class="menu-item"
    @click="toggle"
    :class="active ? 'active' : 'inactive'"
  >
    {{ app.name }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { Application } from '@/types';
import { useApplicationsStore } from '@/stores/applications';

const props = defineProps<{
  app: Application;
}>();

const applications = useApplicationsStore();
const { activeWindowId } = storeToRefs(applications);

const active = computed(() => activeWindowId.value === props.app.id);

// Same as the window's minimize button for the active window; otherwise brings it to the front
function toggle() {
  applications.toggleWindow(props.app.id);
}
</script>

<style scoped lang="scss">
  .menu-item {
    padding: 0px 10px;
    display: flex;
    align-items: center;
    color: #ffff00;
    font-weight: bold;
    user-select: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .inactive {
    background-color: #8080ff;
    border-left: 2px solid #b9b9ff;
    border-right: 2px solid #5c5cd5;
  } 

  .menu-item:active, .active {
    background-color: #6e6eeb;
    border-top: 2px solid #5c5cd5;
    border-left: 2px solid #5c5cd5;
    border-bottom: 2px solid #b9b9ff;
    border-right: 2px solid #5c5cd5;
  }
</style>