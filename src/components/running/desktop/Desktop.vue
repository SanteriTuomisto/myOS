<template>
  <!-- render service -->
  <div id="desktop">
    <div class="desktop-item-wrapper">
      <DesktopItem
        v-for="(item, index) in getDesktopItems"
        :key="index"
        :name="item.name"
        @click="openWindow(item)"
      >
        <BrowserIcon v-if="item.type === 'browser'" />
        <MusicIcon v-else-if="item.type === 'musicPlayer'" />
        <FolderIcon v-else-if="item.type === 'fileExplorer' || item.type === 'folder'" />
        <TerminalIcon v-else-if="item.type === 'terminal'" />
        <SettingsIcon v-else-if="item.type === 'settings'" />
        <FileIcon v-else-if="item.type === 'file'" />
        <TrashIcon v-else-if="item.type === 'recycleBin'" />
        <MonsterIcon v-else-if="item.type === 'monsterSlayer'" />
      </DesktopItem>
    </div>
    <Window
      v-for="app, index in applications" :key="app.id"
      :id="app.id"
      :app="app"
      :index="index"
      :hideBottomBorder="app.type === 'fileExplorer' || app.type === 'browser'"
      :minW="windowMinWidth(app.type)"
      :minH="app.type === 'fileExplorer' ? 350 : 250"
      :initHeight="getWindowSize(app.type).height"
      :initWidth="getWindowSize(app.type).width"
    >
      <FileExplorer v-if="app.type === 'fileExplorer'" :fileSystemId="app.fileSystemId" />
      <MusicPlayer v-if="app.type === 'musicPlayer'" />
      <Browser v-if="app.type === 'browser'" />
      <TextEditor v-if="app.type === 'file'" :id="app.id" :fileSystemId="app.fileSystemId" />
      <TerminalWindow v-if="app.type === 'terminal'" />
      <SettingsWindow v-if="app.type === 'settings'" />
      <MonsterSlayer v-if="app.type === 'monsterSlayer'" />
    </Window>
  </div>
  <div class="desktop-background"
    :class="{
      'desktop-background-1': getBackground === '1',
      'desktop-background-2': getBackground === '2',
      'desktop-background-3': getBackground === '3',
    }"
  >
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import { mapGetters } from 'vuex';
import FolderIcon from '@/assets/FolderIcon.vue';
import TerminalIcon from '@/assets/TerminalIcon.vue';
import TrashIcon from '@/assets/TrashIcon.vue';
import MusicIcon from '@/assets/MusicIcon.vue';
import BrowserIcon from '@/assets/BrowserIcon.vue';
import FileIcon from '@/assets/FileIcon.vue';
import SettingsIcon from '@/assets/SettingsIcon.vue';
import Window from './Window.vue';
import DesktopItem from './DesktopItem.vue';
import FileExplorer from '../fileExplorer/FileExplorer.vue';
import Browser from '../browser/Browser.vue';
import MusicPlayer from '../musicPlayer/MusicPlayer.vue';
import TerminalWindow from '../terminal/TerminalWindow.vue';
import SettingsWindow from '../settings/SettingsWindow.vue';
import MonsterIcon from '@/assets/MonsterIcon.vue';
import MonsterSlayer from '@/components/projects/monsterSlayer/MonsterSlayer.vue';
import { Item, ApplicationType } from '@/store/fileSystem';
import { Application } from '@/store/applications';

export default defineComponent({
  components: {
    Window,
    DesktopItem,
    FolderIcon,
    TerminalIcon,
    BrowserIcon,
    MusicIcon,
    FileIcon,
    TrashIcon,
    FileExplorer,
    Browser,
    MusicPlayer,
    // Lazy so the editor library loads only when a file is opened
    TextEditor: defineAsyncComponent(() => import('../editor/TextEditor.vue')),
    TerminalWindow,
    SettingsWindow,
    SettingsIcon,
    MonsterSlayer,
    MonsterIcon,
  },
  data(): {
    applications: Application[];
  } {
    return {
      applications: [],
    };
  },
  mounted() {
    this.applications = this.getApplications;
  },
  methods: {
    openWindow(item: Item) {
      const application = {
        name: item.name,
        // Folders open in the file explorer
        type: item.type === 'folder' ? 'fileExplorer' : item.type,
        fileSystemId: item.id,
      };
      this.$store.dispatch('openApplication', application);
    },
    windowMinWidth(type: ApplicationType) {
      if (type === 'fileExplorer') {
        return 450;
      }
      if (type === 'file') {
        return 659;
      }
      return 400;
    },
    getWindowSize(type: ApplicationType) {
      return this.$store.getters.getWindowSize(type);
    },
  },
  computed: {
    ...mapGetters({  
      getApplications: 'getApplications',
      getBackground: 'getBackground',
    }),
    getDesktopItems() {
      return this.$store.getters.getFileSystemItems.find((i: Item) => i.name === 'Desktop')?.content || [];
    },
  },
  watch: {
    getApplications(apps) {
      this.applications = apps;
    },
  },
});
</script>

<style scoped lang="scss">
  #desktop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 46px;
    overflow: hidden;
  }

  .desktop-background {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    background: rgb(0,124,128);
    display: flex;
    flex-direction: column;

    &-1 {
      background: linear-gradient(63deg, rgba(0,124,128,1) 0%, rgba(0,128,67,1) 100%);
    }

    &-2 {
      background: linear-gradient(342deg, rgba(52,148,230,1) 0%, rgba(236,110,173,1) 100%);
    }

    &-3 {
      background: linear-gradient(42deg, rgba(255,100,246,1) 0%, rgba(233,255,106,1) 100%);
    }
  }

  .desktop-item-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    align-content: flex-start;
    flex-wrap: wrap;
  }
</style>
