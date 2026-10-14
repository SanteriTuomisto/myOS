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

<script lang="ts">
import { defineComponent } from 'vue';
import {
  NetworkItem,
} from '@/store/browser';

export default defineComponent({
  emits: ['navigate'],
  methods: {
    navigate(network: NetworkItem) {
      this.$emit('navigate', network.url);
    },
  },
  computed: {
    getNetwork(): NetworkItem[] {
      return this.$store.getters['getNetwork'].filter((n: NetworkItem) => n.name !== '404');
    },
  },
});
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