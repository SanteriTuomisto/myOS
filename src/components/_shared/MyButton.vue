<template>
  <button :class="{
    button: !selected,
    'button-selected': selected,
  }">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  selected?: boolean;
}>();
</script>

<style lang="scss" scoped>
.button {
  background-color: #7575e8;
  border-top: 4px solid #b8b8ff;
  border-left: 4px solid #b9b9ff;
  border-right: 4px solid #5c5cd5;
  border-bottom: 4px solid #5c5cd5;
  color: white;
  font-size: 15px;
  font-weight: bold;
  height: 30px;
  padding: 0px 10px;
  cursor: pointer;

  &:active {
    color: #ffff00;
  }

  &-selected {
    @extend .button;
    background-color: #7575e8;
    border-top: 4px solid #5c5cd5;
    border-left: 4px solid #5c5cd5;
    border-right: 4px solid #b9b9ff;
    border-bottom: 4px solid #b9b9ff;
    color: white;
    cursor: default;

    &:active {
      color: white;
    }
  }
}
</style>