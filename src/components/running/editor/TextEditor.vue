<template>
  <div class="editor">
    <div class="save-btn" @click="savebtn">
      <SaveIcon class="icon" />
      <div>
        Save
      </div>
    </div>
    <div style="height: 100%; background-color: white;">
      <div ref="editor" style="height: calc(100% - 42px);"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import SaveIcon from '@/assets/SaveIcon.vue';
import { useApplicationsStore } from '@/stores/applications';
import { useFileSystemStore } from '@/stores/fileSystem';

const props = defineProps<{
  id: number;
  fileSystemId?: number;
}>();

const applications = useApplicationsStore();
const fileSystem = useFileSystemStore();

const editorEl = useTemplateRef<HTMLDivElement>('editor');
// A plain variable, so Vue doesn't make the Quill instance reactive
let quill: Quill | undefined;

onMounted(() => {
  quill = new Quill(editorEl.value!, { theme: 'snow' });
  const text = props.fileSystemId != null ? fileSystem.getFileContent(props.fileSystemId) : undefined;
  if (text) {
    quill.clipboard.dangerouslyPasteHTML(text);
  }
});

function savebtn() {
  if (quill && props.fileSystemId != null) {
    fileSystem.saveFileContent(props.fileSystemId, quill.root.innerHTML);
  }
  applications.closeApplication(props.id);
}
</script>

<style lang="scss" scoped>
.editor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #5c5cd5;
}

.save-btn {
  height: 24px;
  cursor: pointer;
  display: flex;
  padding: 2px 5px;
  gap: 5px;
  width: 72px;
  background-color: #8080ff;
}

.icon {
  width: 20px;
  height: 20px;
}
</style>
