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
            v-for="(item, index) in getCurrentFolder"
            :key="`file-explorer-${index}`"
            :id="item.id"
            :type="item.type"
            :name="item.name"
            :content="item.content"
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

<script>
import { mapGetters } from 'vuex';
import FileSystemItem from './FileSystemItem.vue';
import HomeIcon from '@/assets/HomeIcon.vue';
import ArrowLeft from '@/assets/ArrowLeft.vue';
import FileIcon from '@/assets/FileIcon.vue';
import FolderIcon from '@/assets/FolderIcon.vue';
import TrashIcon from '@/assets/TrashIcon.vue';
import EditIcon from '@/assets/EditIcon.vue';
import Scroller from '@/components/_shared/Scroller.vue';

export default {
  components: {
    FileSystemItem,
    HomeIcon,
    ArrowLeft,
    FileIcon,
    FolderIcon,
    TrashIcon,
    EditIcon,
    Scroller,
  },
  props: {
    fileSystemId: Number,
  },
  data() {
    return {
      selectedItems: [],
      paths: [{
        name: 'home',
        id: -1,
      }],
    };
  },
  created() {
    const folderPath = this.findFolderPath(this.getFileSystemItems, this.fileSystemId);
    if (folderPath) {
      this.paths.push(...folderPath);
    }
  },
  methods: {
    findFolderPath(items, id) {
      for (const item of items) {
        if (item.type !== 'folder') {
          continue;
        }
        const pathItem = { name: item.name, id: item.id, content: item.content };
        if (item.id === id) {
          return [pathItem];
        }
        const subPath = this.findFolderPath(item.content || [], id);
        if (subPath) {
          return [pathItem, ...subPath];
        }
      }
      return null;
    },
    folderClick({ id, name, content }) {
      this.selectedItems = [];
      this.paths.push({ name, id, content });
    },
    selected(id) {
      this.selectedItems.push(id);
    },
    deselected(id) {
      const index = this.selectedItems.indexOf(id);
      if (index === -1) {
        return;
      }
      this.selectedItems.splice(index, 1);
    },
    itemSelected(id) {
      return this.selectedItems.includes(id);
    },
    goHome() {
      this.paths = [{ name: 'home', id: -1 }];
    },
    back() {
      this.paths.pop();
    },
    checkName(name, integer = 1) {
      const combinedName = `${name} ${integer}`;
      const nameExists = this.getCurrentFolder.find(i => i.name.toLowerCase() === combinedName.toLowerCase());
      if (nameExists) {
        return this.checkName(name, integer += 1);
      } else {
        return combinedName;
      }
    },
    addNewFolder() {
      this.$store.dispatch('addNewFile', {
        currentPath: this.paths,
        item: {
          name: this.checkName('Folder'),
          type: 'folder',
        },
      });
    },
    addNewTextFile() {
      this.$store.dispatch('addNewFile', {
        currentPath: this.paths,
        item: {
          name: this.checkName('Text'),
          type: 'file',
        },
      });
    },
    deleteSelectedItems() {
      if (this.selectedItems.length === 0) {
        return;
      }
      this.selectedItems.forEach((id) => {
        this.$store.dispatch('deleteFile', {
          currentPath: this.paths,
          id,
        });
      });
      this.selectedItems = [];
    },
  },
  computed: {
    ...mapGetters({  
      getFileSystemItems: 'getFileSystemItems',
    }),
    getCurrentFolder() {
      const items = this.getFileSystemItems;
      if (this.isHome) {
        return items;
      }
      const lastItem = this.paths[this.paths.length - 1];
      return lastItem.content;
    },
    isHome() {
      return this.paths.length === 1;
    },
  },
};
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
