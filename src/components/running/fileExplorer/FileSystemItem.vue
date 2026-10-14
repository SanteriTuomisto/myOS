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
    <input
      v-if="editing"
      ref="nameInput"
      v-model="draftName"
      class="name-input"
      :class="{ invalid: error }"
      :title="error"
      spellcheck="false"
      @click.stop
      @dblclick.stop
      @keydown.enter="emit('rename', draftName, 'enter')"
      @keydown.esc="emit('cancelRename')"
      @blur="emit('rename', draftName, 'blur')"
    />
    <div v-else class="text">
      {{ name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, useTemplateRef, watch } from 'vue';
import ItemIcon from '@/components/_shared/ItemIcon.vue';
import { useApplicationsStore } from '@/stores/applications';
import type { ItemType } from '@/types';

const props = withDefaults(defineProps<{
  id: number;
  type: ItemType;
  name?: string;
  selected?: boolean;
  /** Shows an input for renaming instead of the name */
  editing?: boolean;
  /** Why the typed name was refused */
  error?: string;
}>(), {
  name: '',
  selected: false,
  editing: false,
  error: '',
});

const emit = defineEmits<{
  selected: [id: number];
  deselected: [id: number];
  folderClick: [folder: { id: number; name: string }];
  rename: [name: string, via: 'enter' | 'blur'];
  cancelRename: [];
}>();

const draftName = ref(props.name);
const nameInput = useTemplateRef<HTMLInputElement>('nameInput');

// Start each rename from the current name, selected so typing replaces it
watch(() => props.editing, async (editing) => {
  if (!editing) {
    return;
  }
  draftName.value = props.name;
  await nextTick();
  nameInput.value?.focus();
  nameInput.value?.select();
}, { immediate: true });

const applications = useApplicationsStore();

function select() {
  if (!props.selected) {
    emit('selected', props.id);
  } else {
    emit('deselected', props.id);
  }
}

function dblclick() {
  if (props.editing) {
    return;
  }
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

.name-input {
  width: 100%;
  font: inherit;
  text-align: center;
  color: white;
  background-color: #282949;
  border: 1px solid #b9b9ff;
  outline: none;

  &.invalid {
    border-color: #ff6b6b;
  }
}

.text {
  text-align: center;
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;
}
</style>
