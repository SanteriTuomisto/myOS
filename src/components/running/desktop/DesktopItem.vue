<template>
  <div class="desktop-item"
    @click="tap"
    @dblclick="doubleClick"
  >
    <div class="icon">
      <slot/>
    </div>
    <div class="item-name">
      {{ name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSmallScreen } from '@/composables/useSmallScreen';

defineProps<{
  name: string;
}>();

const emit = defineEmits<{
  click: [];
}>();

// Double-click opens on desktop; phones open on a single tap, since double-tap is unreliable there
const mobile = useSmallScreen();

function tap() {
  if (mobile.value) {
    emit('click');
  }
}

function doubleClick() {
  if (!mobile.value) {
    emit('click');
  }
}
</script>

<style scoped lang="scss">
  .desktop-item {
    margin: 15px;
    display: flex;
    flex-direction: column;
    width: 100px;
    align-items: center;
    user-select: none;
    cursor: pointer;
    box-sizing: border-box;
    border: 1px solid transparent;
  }
  .icon {
    height: 44px;
    width: 44px;
    color: #393983;
    display: flex;
    align-items: center;
  }
  .item-name {
    margin-top: 10px;
    font-weight: bold;
    text-align: center;
  }
  .desktop-item:active {
    border: 1px solid coral;
  }
</style>
