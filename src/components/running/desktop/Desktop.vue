<template>
  <!-- render service -->
  <div id="desktop">
    <div class="desktop-item-wrapper">
      <DesktopItem
        v-for="item in desktopItems"
        :key="item.id"
        :name="item.name"
        @click="openWindow(item)"
      >
        <ItemIcon :type="item.type" />
      </DesktopItem>
    </div>
    <Window
      v-for="app, index in applications" :key="app.id"
      :app="app"
      :index="index"
      :hideBottomBorder="app.type === 'fileExplorer' || app.type === 'browser'"
      :minW="windowMinWidth(app.type)"
      :minH="app.type === 'fileExplorer' ? 350 : 250"
      :initHeight="applicationsStore.getWindowSize(app.type).height"
      :initWidth="applicationsStore.getWindowSize(app.type).width"
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
      'desktop-background-1': background === '1',
      'desktop-background-2': background === '2',
      'desktop-background-3': background === '3',
    }"
  >
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { storeToRefs } from 'pinia';
import ItemIcon from '@/components/_shared/ItemIcon.vue';
import Window from './Window.vue';
import DesktopItem from './DesktopItem.vue';
import FileExplorer from '../fileExplorer/FileExplorer.vue';
import Browser from '../browser/Browser.vue';
import MusicPlayer from '../musicPlayer/MusicPlayer.vue';
import TerminalWindow from '../terminal/TerminalWindow.vue';
import SettingsWindow from '../settings/SettingsWindow.vue';
import MonsterSlayer from '@/components/projects/monsterSlayer/MonsterSlayer.vue';
import type { AppType, FileSystemItem } from '@/types';
import { useApplicationsStore } from '@/stores/applications';
import { useFileSystemStore } from '@/stores/fileSystem';
import { useSettingsStore } from '@/stores/settings';

// Lazy so the editor library loads only when a file is opened
const TextEditor = defineAsyncComponent(() => import('../editor/TextEditor.vue'));

const applicationsStore = useApplicationsStore();
const fileSystem = useFileSystemStore();
const { applications } = storeToRefs(applicationsStore);
const { background } = storeToRefs(useSettingsStore());

const desktopItems = computed(() => fileSystem.getTopLevelFolder('Desktop'));

function openWindow(item: FileSystemItem) {
  applicationsStore.openApplication({
    name: item.name,
    // Folders open in the file explorer
    type: item.type === 'folder' ? 'fileExplorer' : item.type,
    fileSystemId: item.id,
  });
}

function windowMinWidth(type: AppType) {
  if (type === 'fileExplorer') {
    return 450;
  }
  if (type === 'file') {
    return 659;
  }
  return 400;
}
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
