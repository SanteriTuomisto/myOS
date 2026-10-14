<template>
  <div v-if="showStartMenu" id="menu">
    <StartMenuItem
      v-for="item in startMenuItems"
      :key="item.id"
      :text="item.name"
      @click="openWindow(item)"
    >
      <ItemIcon :type="item.type" class="icon" />
    </StartMenuItem>
    <StartMenuItem text="Shut down" @click="powerOff">
      <PowerIcon class="icon" />
    </StartMenuItem>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PowerIcon from '@/assets/PowerIcon.vue';
import ItemIcon from '@/components/_shared/ItemIcon.vue';
import StartMenuItem from './StartMenuItem.vue';
import type { FileSystemItem } from '@/types';
import { useSystemStore } from '@/stores/system';
import { useApplicationsStore } from '@/stores/applications';
import { useFileSystemStore } from '@/stores/fileSystem';

withDefaults(defineProps<{
  showStartMenu?: boolean;
}>(), {
  showStartMenu: false,
});

const system = useSystemStore();
const applications = useApplicationsStore();
const fileSystem = useFileSystemStore();

const startMenuItems = computed(() => fileSystem.getTopLevelFolder('Start Menu'));

function powerOff() {
  system.togglePower();
}

function openWindow(item: FileSystemItem) {
  applications.openApplication({
    name: item.name,
    // Folders open in the file explorer
    type: item.type === 'folder' ? 'fileExplorer' : item.type,
    fileSystemId: item.id,
  });
}
</script>

<style scoped lang="scss">
#menu {
  z-index: 3;
  display: flex;
  flex-direction: column;
  position: absolute;
  background-color: #8000ff;
  bottom: 46px;
  width: 300px;
  min-width: 200px;
  border-top: 4px solid #004080;
  border-left: 4px solid #004080;
  border-right: 4px solid #000080;
  border-bottom: 4px solid #000080;
  box-shadow: 4px 0px 0px 0px #000000;
}

.icon {
  margin-top: 4px;
  width: 20px;
  height: 20px;
}
</style>
