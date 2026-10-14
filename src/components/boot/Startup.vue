<template>
  <div class="view">
    <div class="eye-wrapper">
      <Eyeball />
      <div class="loading-text">loading...</div>
      <div class="loader">
        <div class="loading-bar">
        </div>
      </div>
    </div>
    <div class="bubble-wrapper">
      <Bubbles class="slide-1" />
    </div>
    <div class="bubble-wrapper">
      <Bubbles class="slide-2" />
    </div>
    <div class="bubble-wrapper">
      <Bubbles class="slide-3" />
    </div>
    <div class="bubble-wrapper">
      <Bubbles class="slide-4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import Eyeball from '@/components/projects/eyeball/Eyeball.vue';
import Bubbles from '@/components/projects/bubbles/Bubbles.vue';
import { useSystemStore } from '@/stores/system';

const system = useSystemStore();
let timeout: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
  timeout = setTimeout(() => {
    system.toggleStartup();
  }, 5000);
});

onUnmounted(() => {
  clearTimeout(timeout);
});
</script>

<style lang="scss" scoped>
.view {
  background: linear-gradient(342deg, rgba(52,148,230,1) 0%, rgba(236,110,173,1) 100%);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  animation: openscreen 0.5s linear;
}

@keyframes openscreen {
  0% {
    transform: rotateY(90deg);
  }
  100% {
    transform: rotateY(0deg);
  }
}

.eye-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.bubble-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.loader {
  opacity: 0.9;
  width: 350px;
}

.loading-bar {
  height: 25px;
  background: linear-gradient(to right, #f52c8a, #dd00ff, #6a00ff);
  animation: borealisBar 5s linear;
  box-shadow: 10px 10px 0px 0px #270f4e;
}

.loading-text {
  text-align: right;
  width: 350px;
  color: #5e00ff;
  letter-spacing: 7px;
  font-size: 20px;
}

@keyframes borealisBar {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}

.slide-1 {
  animation: slide-1 10s ease-in-out both;
}
.slide-2 {
  animation: slide-2 11s ease-in-out both;
}
.slide-3 {
  animation: slide-3 9s ease-in-out both;
}
.slide-4 {
  animation: slide-4 9s ease-in-out both;
}

@keyframes slide-1 {
  0% {
    transform: translateY(0) translateX(0);
  }
  100% {
    transform: translateY(100vh) translateX(100vw);
  }
}

@keyframes slide-2 {
  0% {
    transform: translateY(50vh) translateX(100vw);
  }
  100% {
    transform: translateY(0) translateX(0);
  }
}

@keyframes slide-3 {
  0% {
    transform: translateY(80vh) translateX(0);
  }
  100% {
    transform: translateY(-100px) translateX(10vw);
  }
}

@keyframes slide-4 {
  0% {
    transform: translateY(100vh) translateX(50vw);
  }
  100% {
    transform: translateY(0) translateX(100vw);
  }
}
</style>
