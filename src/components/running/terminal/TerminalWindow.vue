<template>
  <div class="terminal" @click="focusInput" aria-label="Terminal">
    <div>myOs {{ $store.state.version }}</div>
    <div v-for="(line, index) in lines" :key="index">
      <div v-if="line.command != null">
        <span class="prompt">{{ line.prompt }}</span>
        <span>{{ line.command }}</span>
      </div>
      <div v-if="line.response" class="response">{{ line.response }}</div>
    </div>
    <div class="input-row">
      <span class="prompt">{{ prompt }}</span>
      <input
        ref="input"
        v-model="input"
        class="input"
        spellcheck="false"
        autocomplete="off"
        @keydown.enter="submit"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      input: '',
      lines: [],
      paths: [{
        name: 'home',
        id: -1,
      }],
    };
  },
  mounted() {
    this.focusInput();
  },
  methods: {
    focusInput() {
      this.$refs.input?.focus();
    },
    submit() {
      const text = this.input.trim();
      const prompt = this.prompt;
      this.input = '';
      const response = text === '' ? '' : this.commandHandler(text);
      this.lines.push({ prompt, command: text, response });
      this.$nextTick(() => {
        this.$refs.input?.scrollIntoView({ block: 'nearest' });
      });
    },
    commandHandler(text) {
      let response = '';
      const argsIndex = text.indexOf(" ");
      const command = argsIndex !== -1 ? text.substring(0, argsIndex) : text;

      switch (command) {
        case "help":
          response = "commands: ls, cd {0}, open {0}";
          break;
        case "ls":
          for (let i = 0; i < this.getCurrentFolder.length; i += 1) {
            response += `${this.getCurrentFolder[i].name} (${this.getCurrentFolder[i].type}), `;
          }
          break;
        case "cd":
           
          const param = text.substring(argsIndex + 1).toLowerCase();
          if (param === '..') {
            if (!this.isHome) {
              this.paths.pop();
            }
            break;
          }
           
          const folder = this.getCurrentFolder.find(f => f.type === 'folder' && f.name.toLowerCase() === param);
          if (folder) {
            this.paths.push({ name: folder.name, id: folder.id, content: folder.content });
          } else {
            response = "No such folder";
          }
          // TODO vastaa ls?
          break;
        case "open":
           
          const item = this.getCurrentFolder.find(f => f.name.toLowerCase() === text.substring(argsIndex + 1).toLowerCase());
          if (item) {
            this.$store.dispatch('openApplication', {
              name: item.name,
              type: item.type,
              fileSystemId: item.id,
            });
          } else {
            response = "No such file or program"
          }
          break;
        default:
          response = "Unknown command: " + command + ", try help";
      }

      return response;
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
    prompt() {
      const paths = this.paths.map(p => p.name);
      return `$ ${paths.join('/')}:~ `;
    },
  },
};
</script>

<style scoped>
.terminal {
  box-sizing: border-box;
  background-color: black;
  color: #d2d2d2;
  height: 100%;
  width: 100%;
  padding: 8px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
}

.prompt {
  color: #9e9ede;
  margin-right: 4px;
}

.response {
  color: #717199;
}

.input-row {
  display: flex;
}

.input {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font: inherit;
}
</style>
