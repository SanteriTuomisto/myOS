<template>
  <div class="background">
    <div class="wrapper"
      :class="{
        'zoom': zoom,
      }"
    >
      <div class="computer">
        <div class="screen">
          <Bootup v-if="showBootup" />
        </div>
        <div class="button-wrapper">
          <div :class="{
            'led-on': powerOn,
            'led-off': !powerOn,
          }">
          </div>
          <div class="start-button" @click="start">
            <PowerIcon class="icon" />
          </div>
        </div>
      </div>
      <div style="display: flex; justify-content: center;">
        <div class="stand">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PowerIcon from '@/assets/PowerIcon.vue';
import Bootup from '@/components/boot/Bootup.vue';
import { useSystemStore } from '@/stores/system';

const system = useSystemStore();
// Local LED/animation state; the store is powered on once the boot animation ends
const powerOn = ref(false);
const zoom = ref(false);
const showBootup = ref(false);

function start() {
  if (powerOn.value) {
    return;
  }
  powerOn.value = true;
  setTimeout(() => {
    zoom.value = true;
    showBootup.value = true;
    setTimeout(() => {
      system.togglePower();
    }, 5000);
  }, 500);
}
</script>

<style lang="scss" scoped>
.background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgb(145,145,145);
  background: radial-gradient(circle, rgba(145,145,145,1) 0%, rgba(0,0,0,1) 100%);
}
.wrapper {
  width: 800px;
}
.computer {
  background: rgb(221,210,186);
  background: linear-gradient(135deg, rgba(221,210,186,1) 0%, rgba(193,182,159,1) 100%);
  padding: 90px 80px 30px 80px;
  border-radius: 5px;
  box-shadow: 0px -4px 1px 0px #f3e3c2;
}

.screen {
  height: 400px;
  border-radius: 5px;
  box-sizing: border-box;
  background: rgb(80,88,85);
  background: radial-gradient(circle, rgba(80,88,85,1) 0%, rgba(65,67,62,1) 100%);
  box-shadow: inset 0px 0px 20px 4px #0c0c0c;
}

.zoom {
  transition: transform 3s;
  transform: scale(120%);
  overflow: hidden;
}

.button-wrapper {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
  gap: 20px;
}

.led {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  &-on {
    @extend .led; 
    background: rgb(25,222,2);
    background: radial-gradient(circle, rgba(25,222,2,1) 0%, rgba(8,182,19,1) 100%);
  }
  &-off {
    @extend .led;
    background: #7e7e7e;
    background: radial-gradient(circle, #7e7e7e 0%, #727272 100%);
  }
}

.start-button {
  box-shadow: 0px 0px 0px 5px #b5a98f;
  border: 2px solid #878282;
  display: flex;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  height: 60px;
  width: 60px;
  border-radius: 50%;
  cursor: pointer;
  background: rgb(221,210,186);
  background: linear-gradient(135deg, rgba(221,210,186,1) 0%, rgba(193,182,159,1) 100%);
  
  &:active {
    border: 4px solid #878282;
  }
}
.icon {
  width: 30px;
  height: 30px;
  color: #4f4d47;
}

.stand {
  width: 80%;
  border-radius: 0px 0px 5px 5px;
  height: 50px;
  background: rgb(193,182,159);
  background: linear-gradient(135deg, rgba(193,182,159,1) 0%, rgba(168,159,140,1) 100%);
  box-shadow: inset 0px 5px 2px 0px #676054;
}
</style>
