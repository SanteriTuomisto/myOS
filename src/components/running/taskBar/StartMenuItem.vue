<template>
  <div class="menu-item"
    @click="menuItemClicked"
  >
    <div>
      <slot/>
    </div>
    <div>
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSystemStore } from '@/stores/system';

defineProps<{
  text: string;
}>();

const emit = defineEmits<{
  click: [];
}>();

const system = useSystemStore();

function menuItemClicked() {
  system.toggleStartMenu();
  emit('click');
}
</script>

<style scoped lang="scss">
  .menu-item {
    display: flex;
    padding-left: 12px;
    gap: 15px;
    background-color: #8080ff;
    height: 50px;
    align-items: center;
    border-top: 4px solid #b9b9ff;
    border-left: 4px solid #b9b9ff;
    border-bottom: 4px solid #5c5cd5;
    border-right: 4px solid #5c5cd5;
    color: #ffff00;
    font-weight: bold;
    user-select: none;
    cursor: pointer;
  }

  .menu-item:active {
    border-top: 4px solid #5c5cd5;
    border-left: 4px solid #5c5cd5;
    border-bottom: 4px solid #b9b9ff;
    border-right: 4px solid #5c5cd5;
  }
</style>