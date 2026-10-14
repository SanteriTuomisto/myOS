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
      v-for="{ app, definition, index } in windows" :key="app.id"
      v-slot="{ interactive }"
      :app="app"
      :index="index"
      :hideBottomBorder="definition.hideBottomBorder"
      :minW="definition.minSize.width"
      :minH="definition.minSize.height"
      :initHeight="applicationsStore.getWindowSize(app.type, definition.defaultSize).height"
      :initWidth="applicationsStore.getWindowSize(app.type, definition.defaultSize).width"
    >
      <ExternalApp
        v-if="definition.kind === 'external'"
        :url="definition.url"
        :name="app.name"
        :interactive="interactive"
      />
      <component
        :is="definition.component"
        v-else-if="definition.component"
        v-bind="definition.props?.(app)"
      />
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
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import ItemIcon from '@/components/_shared/ItemIcon.vue';
import Window from './Window.vue';
import DesktopItem from './DesktopItem.vue';
import ExternalApp from './ExternalApp.vue';
import type { FileSystemItem } from '@/types';
import { getApp } from '@/apps/registry';
import { useApplicationsStore } from '@/stores/applications';
import { useFileSystemStore } from '@/stores/fileSystem';
import { useSettingsStore } from '@/stores/settings';

const applicationsStore = useApplicationsStore();
const fileSystem = useFileSystemStore();
const { applications } = storeToRefs(applicationsStore);
const { background } = storeToRefs(useSettingsStore());

const desktopItems = computed(() => fileSystem.getTopLevelFolder('Desktop'));

// Apps whose id is no longer in the registry (e.g. from old saved state) get no window
const windows = computed(() => applications.value.flatMap((app, index) => {
  const definition = getApp(app.type);
  return definition ? [{ app, definition, index }] : [];
}));

function openWindow(item: FileSystemItem) {
  applicationsStore.openApplication({
    name: item.name,
    // Folders open in the file explorer
    type: item.type === 'folder' ? 'fileExplorer' : item.type,
    fileSystemId: item.id,
  });
}
</script>

<style scoped lang="scss">
  #desktop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 46px;
    // clip, not hidden: a hidden container can still be scrolled, e.g. when an input in a
    // window that sticks out past the edge gets focus, which shifts every window sideways
    overflow: clip;
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
