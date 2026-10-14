<template>
  <div class="game">
    <div v-if="view === 'main'">
      <button @click="changeView('shop')">shop</button>
      <button @click="changeView('gear')">gear</button>
      <button @click="changeView('fight')">fight</button>
    </div>
    <div v-else-if="view === 'fight'" style="height: 100%;">
      <FightView
        :startPlayerHealth="100"
        :startMonsterHealth="100"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FightView from './FightView.vue';

type View = 'main' | 'shop' | 'gear' | 'fight';

const view = ref<View>('main');

function changeView(newView: View) {
  view.value = newView;
}
</script>

<style scoped lang="scss">
.game {
  width: 100%;
  height: 100%;
  background: black;
}
</style>