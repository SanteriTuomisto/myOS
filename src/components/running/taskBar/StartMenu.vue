<template>
  <div v-if="showStartMenu" id="menu">
    <StartMenuItem
      v-for="(item, index) in getStartMenuItems"
      :key="index"
      :text="item.name"
      @click="openWindow(item)"
    >
      <BrowserIcon v-if="item.type === 'browser'" class="icon" />
      <MusicIcon v-else-if="item.type === 'musicPlayer'" class="icon" />
      <FolderIcon v-else-if="item.type === 'fileExplorer' || item.type === 'folder'" class="icon" />
      <TerminalIcon v-else-if="item.type === 'terminal'" class="icon" />
      <SettingsIcon v-else-if="item.type === 'settings'" class="icon" />
      <FileIcon v-else-if="item.type === 'file'" class="icon" />
    </StartMenuItem>
    <StartMenuItem :id="2" text="Shut down" @click="powerOff">
      <PowerIcon class="icon" />
    </StartMenuItem>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapGetters } from 'vuex';
import FolderIcon from '@/assets/FolderIcon.vue';
import TerminalIcon from '@/assets/TerminalIcon.vue';
import PowerIcon from '@/assets/PowerIcon.vue';
import FileIcon from '@/assets/FileIcon.vue';
import MusicIcon from '@/assets/MusicIcon.vue';
import BrowserIcon from '@/assets/BrowserIcon.vue';
import SettingsIcon from '@/assets/SettingsIcon.vue';
import StartMenuItem from './StartMenuItem.vue';
import { Item } from '@/store/fileSystem';

export default defineComponent({
  components: {
    StartMenuItem,
    FolderIcon,
    TerminalIcon,
    PowerIcon,
    MusicIcon,
    BrowserIcon,
    SettingsIcon,
    FileIcon,
  },
  props: {
    showStartMenu: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    powerOff() {
      this.$store.dispatch('togglePower');
    },
    openWindow(item: Item) {
      const application = {
        name: item.name,
        // Folders open in the file explorer
        type: item.type === 'folder' ? 'fileExplorer' : item.type,
        fileSystemId: item.id,
      };
      this.$store.dispatch('openApplication', application);
    },
  },
  computed: {
    ...mapGetters({  
      getFileSystemItems: 'getFileSystemItems',
    }),
    getStartMenuItems() {
      return this.getFileSystemItems.find((i: Item) => i.name === 'Start Menu')?.content || [];
    },
  },
});
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
