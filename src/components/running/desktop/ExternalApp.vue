<template>
  <div class="external-app">
    <iframe
      :src="url"
      :title="name"
      :class="{ 'no-pointer': !interactive }"
      allow="autoplay; fullscreen"
      allowfullscreen
      @load="loaded = true"
    />
    <div v-if="!loaded" class="loading">Loading {{ name }}...</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

withDefaults(defineProps<{
  url: string;
  name: string;
  /**
   * False while the window is inactive or being dragged/resized. The iframe would otherwise
   * swallow the mouse events, so drags stop and clicking an inactive window doesn't focus it.
   */
  interactive?: boolean;
}>(), {
  interactive: true,
});

const loaded = ref(false);
</script>

<style scoped lang="scss">
  .external-app {
    position: relative;
    width: 100%;
    height: 100%;
    background: #000000;
  }

  iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: none;
  }

  .no-pointer {
    pointer-events: none;
  }

  .loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
  }
</style>
