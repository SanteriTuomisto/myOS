<template>
  <div class="recycle-bin">
    <div class="toolbar">
      <MyButton :disabled="isEmpty" @click="fileSystem.restoreAll()">Restore all</MyButton>
      <MyButton :disabled="isEmpty" @click="fileSystem.emptyRecycleBin()">Empty bin</MyButton>
    </div>
    <div class="list">
      <Scroller>
        <div v-if="isEmpty" class="empty">The recycle bin is empty</div>
        <div v-for="entry in recycleBin" :key="entry.item.id" class="row">
          <ItemIcon :type="entry.item.type" class="icon" />
          <div class="name">{{ entry.item.name }}</div>
          <div class="location" :title="location(entry)">{{ location(entry) }}</div>
          <MyButton @click="fileSystem.restoreItem(entry.item.id)">Restore</MyButton>
        </div>
      </Scroller>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import ItemIcon from '@/components/_shared/ItemIcon.vue';
import MyButton from '@/components/_shared/MyButton.vue';
import Scroller from '@/components/_shared/Scroller.vue';
import { useFileSystemStore } from '@/stores/fileSystem';
import type { RecycledItem } from '@/types';

const fileSystem = useFileSystemStore();
const { recycleBin } = storeToRefs(fileSystem);

const isEmpty = computed(() => recycleBin.value.length === 0);

function location(entry: RecycledItem): string {
  return `${entry.originalPath.map((step) => step.name).join('/')}/`;
}
</script>

<style scoped lang="scss">
.recycle-bin {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #333362;
}

.toolbar {
  display: flex;
  gap: 10px;
  padding: 6px 10px;
  background-color: #7575e8;
  border-left: 4px solid #b9b9ff;
  border-right: 4px solid #5c5cd5;
  border-bottom: 4px solid #5c5cd5;
}

.list {
  flex: 1;
  min-height: 0;
}

.empty {
  padding: 20px;
  text-align: center;
  color: #9090e6;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-bottom: 1px solid #292965;
}

.icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #9090e6;
}
</style>
