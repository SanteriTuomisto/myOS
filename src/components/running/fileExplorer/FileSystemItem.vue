<template>
  <div class="item"
    :class="{
      'item-selected': selected,
    }"
    @click="select"
    @dblclick="dblclick"
  >
    <div class="icon">
      <ItemIcon :type="type" />
    </div>
    <div class="text">
      {{ name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import ItemIcon from '@/components/_shared/ItemIcon.vue';
import { useApplicationsStore } from '@/stores/applications';
import type { ItemType } from '@/types';

const props = withDefaults(defineProps<{
  id: number;
  type: ItemType;
  name?: string;
  selected?: boolean;
}>(), {
  name: '',
  selected: false,
});

const emit = defineEmits<{
  selected: [id: number];
  deselected: [id: number];
  folderClick: [folder: { id: number; name: string }];
}>();

const applications = useApplicationsStore();

function select() {
  if (!props.selected) {
    emit('selected', props.id);
  } else {
    emit('deselected', props.id);
  }
}

function dblclick() {
  if (props.type === 'folder') {
    emit('folderClick', { id: props.id, name: props.name });
    return;
  }
  applications.openApplication({
    name: props.name,
    type: props.type,
    fileSystemId: props.id,
  });
}
</script>

<style lang="scss" scoped>
.item {
  display: flex;
  flex-direction: column;
  user-select: none;
  justify-content: center;
  width: 120px;
  height: 80px;
  gap: 5px;
  overflow: hidden;
  cursor: pointer;

  &-selected {
    background-color: #282949;
  }
}

.icon {
  align-self: center;
  height: 30px;
  width: 30px;
}

.text {
  text-align: center;
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;
}
</style>
