<template>
  <component :is="icon" v-if="icon" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ItemType } from '@/types';
import FolderIcon from '@/assets/FolderIcon.vue';
import { getApp } from '@/apps/registry';

const props = defineProps<{
  type: ItemType;
}>();

const icon = computed(() => (props.type === 'folder' ? FolderIcon : getApp(props.type)?.icon));
</script>
