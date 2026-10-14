<template>
  <component :is="icon" v-if="icon" />
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';
import type { ItemType } from '@/types';
import BrowserIcon from '@/assets/BrowserIcon.vue';
import FileIcon from '@/assets/FileIcon.vue';
import FolderIcon from '@/assets/FolderIcon.vue';
import MonsterIcon from '@/assets/MonsterIcon.vue';
import MusicIcon from '@/assets/MusicIcon.vue';
import SettingsIcon from '@/assets/SettingsIcon.vue';
import TerminalIcon from '@/assets/TerminalIcon.vue';
import TrashIcon from '@/assets/TrashIcon.vue';

const props = defineProps<{
  type: ItemType;
}>();

const icons: Record<ItemType, Component> = {
  folder: FolderIcon,
  fileExplorer: FolderIcon,
  file: FileIcon,
  browser: BrowserIcon,
  musicPlayer: MusicIcon,
  terminal: TerminalIcon,
  settings: SettingsIcon,
  recycleBin: TrashIcon,
  monsterSlayer: MonsterIcon,
};

const icon = computed(() => icons[props.type]);
</script>
