<template>
  <div :class="{
    scrollbar: scrollOn,
    scrollOff: !scrollOn,
  }">
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  scrollOn?: boolean;
}>(), {
  scrollOn: true,
});
</script>

<style lang="scss" scoped>
.scrollOff {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.scrollbar {
  width: 100%;
  height: 100%;
  overflow: auto;
}
.scrollbar::-webkit-scrollbar {
  height: 30px;
  width: 30px;
}
 
.scrollbar::-webkit-scrollbar-track {
  background-color: #8000FF;
  border-right: 4px solid #5c07b1;
  border-left: 4px solid #9022ff;
}
 
.scrollbar::-webkit-scrollbar-thumb {
  background-color: #8080FF;
  border-top: 4px solid #004080;
  border-left: 4px solid #004080;
  border-right: 4px solid #000000;
  border-bottom: 4px solid #000000;
}


.scrollbar::-webkit-scrollbar-button:vertical:start:decrement {
  height: 30px;
  width: 30px;
  background-color: #8080FF;
  display: block;
  border-top: 4px solid #004080;
  border-left: 4px solid #004080;
  border-right: 4px solid #000080;
  border-bottom: 4px solid #000080;
  background-image: url('../../assets/caret-up.svg');
  background-repeat: no-repeat;   
  background-size: 50%;
  background-position: center 4px;
}
.scrollbar::-webkit-scrollbar-button:vertical:end:increment {
  height: 30px;
  width: 30px;
  background-color: #8080FF;
  display: block;
  border-top: 4px solid #004080;
  border-left: 4px solid #004080;
  border-right: 4px solid #000080;
  border-bottom: 4px solid #000080;
  background-image: url('../../assets/caret-down.svg');
  background-repeat: no-repeat;   
  background-size: 50%;
  background-position: center;
}
.scrollbar::-webkit-scrollbar-button:vertical:start:increment {
  display: none;
}
.scrollbar::-webkit-scrollbar-button:vertical:end:decrement {
  display: none;
}

.scrollbar::-webkit-scrollbar-button:horizontal:start:decrement {
  height: 30px;
  width: 30px;
  background-color: #8080FF;
  display: block;
  border-top: 4px solid #004080;
  border-left: 4px solid #004080;
  border-right: 4px solid #000080;
  border-bottom: 4px solid #000080;
  background-image: url('../../assets/caret-up.svg');
  background-repeat: no-repeat;   
  background-size: 50%;
  background-position: center 4px;
}
.scrollbar::-webkit-scrollbar-button:horizontal:end:increment {
  height: 30px;
  width: 30px;
  background-color: #8080FF;
  display: block;
  border-top: 4px solid #004080;
  border-left: 4px solid #004080;
  border-right: 4px solid #000080;
  border-bottom: 4px solid #000080;
  background-image: url('../../assets/caret-down.svg');
  background-repeat: no-repeat;   
  background-size: 50%;
  background-position: center;
}
.scrollbar::-webkit-scrollbar-button:horizontal:start:increment {
  display: none;
}
.scrollbar::-webkit-scrollbar-button:horizontal:end:decrement {
  display: none;
}

.scrollbar::-webkit-scrollbar-corner {
  background: #4e0e8d;
}
</style>