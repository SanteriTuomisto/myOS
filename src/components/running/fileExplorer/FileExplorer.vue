<template>
  <div class="file-explorer">
    <div class="buttons">
      <div style="display: flex; align-items: center; height: 30px;">
        <div title="Home" style="height: 30px;">
          <HomeIcon class="icon" @click="goHome" />
        </div>
        <div title="Back" style="height: 30px;">
          <ArrowLeft class="icon" @click="back" v-if="!isHome" />
        </div>
      </div>
      <div style="display: flex; align-items: center;">
        <div class="line">
        </div>
        <div title="New folder" style="height: 30px;">
          <FolderIcon class="icon" @click="addNewFolder" />
        </div>
        <div title="New text file" style="height: 30px;">
          <FileIcon class="icon" @click="addNewTextFile" />
        </div>
        <div class="line">
        </div>
        <div title="Rename" style="height: 30px;">
          <EditIcon class="icon" :class="{
            'disabled': selectedItems.length !== 1,
          }" />
        </div>
        <div title="Delete" style="height: 30px;">
          <TrashIcon class="icon"
            :class="{
              'disabled': selectedItems.length === 0,
            }"
            @click="deleteSelectedItems"
          />
        </div>
      </div>
    </div>
    <div class="path">
      <span v-for="(p, index) in paths" :key="`path-item-${index}`">{{ p.name }}/</span>
    </div>
    <div style="height: calc(100% - 60px);">
      <Scroller>
        <div class="items">
          <FileSystemItem
            v-for="item in getCurrentFolder"
            :key="item.id"
            :id="item.id"
            :type="item.type"
            :name="item.name"
            :selected="itemSelected(item.id)"
            @selected="selected"
            @deselected="deselected"
            @folderClick="folderClick"
          />
        </div>
      </Scroller>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import FileSystemItem from './FileSystemItem.vue';
import HomeIcon from '@/assets/HomeIcon.vue';
import ArrowLeft from '@/assets/ArrowLeft.vue';
import FileIcon from '@/assets/FileIcon.vue';
import FolderIcon from '@/assets/FolderIcon.vue';
import TrashIcon from '@/assets/TrashIcon.vue';
import EditIcon from '@/assets/EditIcon.vue';
import Scroller from '@/components/_shared/Scroller.vue';
import { ROOT_PATH, useFileSystemStore } from '@/stores/fileSystem';
import type { ItemType, PathItem } from '@/types';

const props = defineProps<{
  fileSystemId?: number;
}>();

const fileSystem = useFileSystemStore();

const selectedItems = ref<number[]>([]);
const paths = ref<PathItem[]>(
  (props.fileSystemId != null && fileSystem.findFolderPath(props.fileSystemId)) || [...ROOT_PATH],
);

const getCurrentFolder = computed(() => fileSystem.getFolderContent(paths.value) ?? []);
const isHome = computed(() => paths.value.length === 1);

function folderClick({ id, name }: { id: number; name: string }) {
  selectedItems.value = [];
  paths.value.push({ id, name });
}

function selected(id: number) {
  selectedItems.value.push(id);
}

function deselected(id: number) {
  const index = selectedItems.value.indexOf(id);
  if (index === -1) {
    return;
  }
  selectedItems.value.splice(index, 1);
}

function itemSelected(id: number) {
  return selectedItems.value.includes(id);
}

function goHome() {
  selectedItems.value = [];
  paths.value = [...ROOT_PATH];
}

function back() {
  selectedItems.value = [];
  paths.value.pop();
}

function addNew(type: ItemType, baseName: string) {
  fileSystem.addItem(paths.value, type, fileSystem.uniqueName(paths.value, baseName));
}

function addNewFolder() {
  addNew('folder', 'Folder');
}

function addNewTextFile() {
  addNew('file', 'Text');
}

function deleteSelectedItems() {
  if (selectedItems.value.length === 0) {
    return;
  }
  selectedItems.value.forEach((id) => {
    fileSystem.deleteItem(paths.value, id);
  });
  selectedItems.value = [];
}
</script>

<style lang="scss" scoped>
.file-explorer {
  width: 100%;
  height: 100%;
  background-color: #333362;
}

.buttons {
  display: flex;
  justify-content: space-between;
  background-color: #7575e8;
  border-left: 4px solid #b9b9ff;
  border-right: 4px solid #5c5cd5;
}

.items {
  display: flex;
  flex-wrap: wrap;
}

.icon {
  width: 30px;
  height: 30px;
  cursor: pointer;
  padding: 5px;
}
.disabled {
  color: #9090e6;
  cursor: default;
}

.path {
  background-color: #7575e8;
  border-left: 4px solid #b9b9ff;
  border-right: 4px solid #5c5cd5;
  color: black;
  padding: 2px 5px;
  overflow: hidden;
  border-bottom: 4px solid #5c5cd5;
  user-select: none;
}

.line {
  width: 3px;
  height: 30px;
  background-color: #8080ff;
}
</style>
