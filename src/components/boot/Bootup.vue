<template>
  <div class="console">
    <div class="text">
      COMPUTER (C) 1990 Motherboard
    </div>
    <div class="text" style="animation-delay: 700ms;">
      {{ row2 }}
    </div>
    <div class="text" style="animation-delay: 1400ms;">
      {{ row3 }}
    </div>
    <div class="text-infinite" style="margin-top: 40px; animation-delay: 2100ms;" >
      {{ row4 }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useSystemStore } from '@/stores/system';

const system = useSystemStore();
const row2 = ref<string | null>(null);
const row3 = ref<string | null>(null);
const row4 = ref<string | null>(null);
const timeouts: ReturnType<typeof setTimeout>[] = [];

onMounted(() => {
  timeouts.push(
    setTimeout(() => {
      row2.value = `VERSION ${system.version}`;
    }, 700),
    setTimeout(() => {
      row3.value = 'CPU: Intel (R) CPU 330';
    }, 1400),
    setTimeout(() => {
      row4.value = 'Booting from Hard Disk...';
    }, 2100),
  );
});

onUnmounted(() => {
  timeouts.forEach(clearTimeout);
});
</script>

<style scoped lang="scss">
.console {
  font-weight: bold;
  font-family: monospace;
  font-size: 18px;
  padding: 30px 40px;
  color: #878787;
  user-select: none;
}

.text {
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
  animation: type 1s steps(60, end);  
}

.text-infinite {
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
  animation: type 2s steps(60, end) infinite;
}
@keyframes type{ 
  from { width: 0; } 
} 
</style>