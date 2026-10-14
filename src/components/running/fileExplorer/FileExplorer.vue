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
            'disabled': !canRename,
          }" @click="renameSelected" />
        </div>
        <div title="Delete" style="height: 30px;">
          <TrashIcon class="icon"
            :class="{
              'disabled': !canDelete,
            }"
            @click="deleteSelectedItems"
          />
        </div>
      </div>
    </div>
    <div class="path">
      <span v-for="(p, index) in paths" :key="`path-item-${index}`">{{ p.name }}/</span>
      <span v-if="renameError" class="error">{{ renameError }}</span>
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
            :editing="renamingId === item.id"
            :error="renamingId === item.id ? renameError : ''"
            @selected="selected"
            @deselected="deselected"
            @folderClick="folderClick"
            @rename="(name, via) => rename(item.id, name, via)"
            @cancelRename="stopRenaming"
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
const renamingId = ref<number | null>(null);
const renameError = ref('');
const paths = ref<PathItem[]>(
  (props.fileSystemId != null && fileSystem.findFolderPath(props.fileSystemId)) || [...ROOT_PATH],
);

const getCurrentFolder = computed(() => fileSystem.getFolderContent(paths.value) ?? []);
const isHome = computed(() => paths.value.length === 1);
const selectedEntries = computed(() => getCurrentFolder.value.filter((item) => selectedItems.value.includes(item.id)));
// System items (Desktop, Start Menu, ...) can't be renamed or deleted
const canRename = computed(() => selectedEntries.value.length === 1 && !selectedEntries.value[0].protected);
const canDelete = computed(() => selectedEntries.value.length > 0 && selectedEntries.value.every((item) => !item.protected));

function startRenaming(id: number) {
  renamingId.value = id;
  renameError.value = '';
}

function stopRenaming() {
  renamingId.value = null;
  renameError.value = '';
}

function renameSelected() {
  if (canRename.value) {
    startRenaming(selectedEntries.value[0].id);
  }
}

// An invalid name keeps the input open after Enter; leaving the input gives up and keeps the old name
function rename(id: number, name: string, via: 'enter' | 'blur') {
  if (renamingId.value !== id) {
    return;
  }
  const error = fileSystem.renameItem(paths.value, id, name);
  if (!error || via === 'blur') {
    stopRenaming();
  } else {
    renameError.value = error;
  }
}

function folderClick({ id, name }: { id: number; name: string }) {
  stopRenaming();
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
  stopRenaming();
  selectedItems.value = [];
  paths.value = [...ROOT_PATH];
}

function back() {
  stopRenaming();
  selectedItems.value = [];
  paths.value.pop();
}

// New items start with a free "Folder N"/"Text N" name, ready to be renamed
function addNew(type: ItemType, baseName: string) {
  const item = fileSystem.addItem(paths.value, type, fileSystem.uniqueName(paths.value, baseName));
  if (item) {
    selectedItems.value = [item.id];
    startRenaming(item.id);
  }
}

function addNewFolder() {
  addNew('folder', 'Folder');
}

function addNewTextFile() {
  addNew('file', 'Text');
}

function deleteSelectedItems() {
  if (!canDelete.value) {
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

.error {
  margin-left: 10px;
  color: #8b0000;
  font-weight: bold;
}

.line {
  width: 3px;
  height: 30px;
  background-color: #8080ff;
}
</style>
