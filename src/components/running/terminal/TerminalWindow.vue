<template>
  <div class="terminal" @click="focusInput" aria-label="Terminal">
    <div>myOs {{ version }}</div>
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
        ref="terminalInput"
        v-model="input"
        class="input"
        spellcheck="false"
        autocomplete="off"
        @keydown.enter="submit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue';
import { ROOT_PATH, useFileSystemStore } from '@/stores/fileSystem';
import { useApplicationsStore } from '@/stores/applications';
import { useSystemStore } from '@/stores/system';
import type { PathItem } from '@/types';
import { runCommand } from './commands';

interface Line {
  prompt: string;
  command: string;
  response: string;
}

const fileSystem = useFileSystemStore();
const applications = useApplicationsStore();
const { version } = useSystemStore();

const inputEl = useTemplateRef<HTMLInputElement>('terminalInput');
const input = ref('');
const lines = ref<Line[]>([]);
const paths = ref<PathItem[]>([...ROOT_PATH]);

const prompt = computed(() => `$ ${paths.value.map((p) => p.name).join('/')}:~ `);

onMounted(() => {
  focusInput();
});

function focusInput() {
  inputEl.value?.focus();
}

function submit() {
  const text = input.value.trim();
  const currentPrompt = prompt.value;
  input.value = '';
  let response = '';
  if (text !== '') {
    const result = runCommand(text, {
      path: paths.value,
      folder: fileSystem.getFolderContent(paths.value) ?? [],
      openApplication: applications.openApplication,
    });
    response = result.response;
    paths.value = result.path;
  }
  lines.value.push({ prompt: currentPrompt, command: text, response });
  nextTick(() => {
    inputEl.value?.scrollIntoView?.({ block: 'nearest' });
  });
}
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
