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

<script>
import SaveIcon from '@/assets/SaveIcon.vue';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

export default {
  components: {
    SaveIcon,
  },
  props: {
    id: Number,
    fileSystemId: Number,
  },
  mounted() {
    // Kept off data() so Vue doesn't make the Quill instance reactive
    this.quill = new Quill(this.$refs.editor, { theme: 'snow' });
    const fileSystemItem = this.$store.getters.getItem(this.fileSystemId);
    if (fileSystemItem && fileSystemItem.data) {
      this.quill.clipboard.dangerouslyPasteHTML(fileSystemItem.data);
    }
  },
  methods: {
    savebtn() {
      this.$store.dispatch('closeApplication', this.id);
      this.$store.dispatch('saveFileContent', { id: this.fileSystemId, text: this.quill.root.innerHTML });
    },
  },
};
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
