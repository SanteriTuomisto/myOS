<template>
  <input
    class="input"
    :type="type"
    :value="getValue"
    @input="input"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  modelValue?: string;
  value?: string;
  type?: string;
}>(), {
  modelValue: undefined,
  value: '',
  type: 'text',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  input: [value: string];
}>();

const getValue = computed(() => props.modelValue ?? props.value);

function input(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  emit('update:modelValue', value);
  emit('input', value);
}
</script>

<style lang="scss" scoped>
.input {
  outline: none;
  background-color: #7575e8;
  color: white;
  height: 32px;
  font-size: 17px;
  padding: 4px;
  border-bottom: 4px solid #b8b8ff;
  border-right: 4px solid #b9b9ff;
  border-left: 4px solid #5c5cd5;
  border-top: 4px solid #5c5cd5;
}
</style>