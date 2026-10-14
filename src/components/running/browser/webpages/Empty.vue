<template>
  <div class="page">
    <div class="header">
      404
    </div>
    <div class="text">
      Page not found, try these:
    </div>
    <div v-for="(network, index) in getNetwork"
      :key="index"
    >
      <div class="link" @click="() => navigate(network)">{{ network.name }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { network, notFound, type WebPage } from '../network';

const emit = defineEmits<{
  navigate: [url: string];
}>();

const getNetwork = network.filter((page) => page !== notFound);

function navigate(page: WebPage) {
  emit('navigate', page.url);
}
</script>

<style scoped lang="scss">
.page {
  padding: 20px;
}
.header {
  font-size: 30px;
}
.text {
  font-size: 20px;
  padding-bottom: 10px;
}
.link {
  text-decoration: underline;
  color: lightblue;
  cursor: pointer;
}
</style>