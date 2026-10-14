<template>
  <div style="width: 100%; height: 100%;">
    <div class="browser-toolbar">
      <div style="flex: 0 0 40px; height: 25px;">
        <ArrowLeft v-if="history.length > 1" @click="backwards" style="height: 25px; width: 25px; cursor: pointer;" />
      </div>
      <div style="flex: 0 0 40px; height: 25px;">
        <HomeIcon @click="home" style="height: 25px; width: 25px; cursor: pointer;" />
      </div>
      <div style="flex: 1 1 auto;">
        <MyInput :value="currentUrl" style="width: 90%;" @keyup.enter="urlBarEnter" />
      </div>
    </div>
    <div class="browser-content">
      <Scroller :scrollOn="currentPage?.name !== 'myOs'">
        <Boogle v-if="currentPage?.name === 'Boogle'"/>
        <Bacefook v-else-if="currentPage?.name === 'Bacefook'" />
        <DadGpt v-else-if="currentPage?.name === 'DadGPT'" />
        <myOs v-else-if="currentPage?.name === 'myOs'" />
        <Empty v-else-if="currentPage == null || currentPage.name === '404'" @navigate="navigate" />
      </Scroller>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Scroller from '@/components/_shared/Scroller.vue';
import { boogle, findPage, type WebPage } from './network';
import Boogle from './webpages/boogle/Boogle.vue';
import Empty from './webpages/Empty.vue';
import Bacefook from './webpages/Bacefook.vue';
import DadGpt from './webpages/DadGpt.vue';
import myOs from './webpages/myOs.vue';
import HomeIcon from '@/assets/HomeIcon.vue';
import ArrowLeft from '@/assets/ArrowLeft.vue';
import MyInput from '@/components/_shared/MyInput.vue';

// Each browser window keeps its own history
const history = ref<WebPage[]>([boogle]);

const currentPage = computed<WebPage | undefined>(() => history.value[history.value.length - 1]);
const currentUrl = computed(() => currentPage.value?.url || '');

function home() {
  history.value = [boogle];
}

function navigate(url: string) {
  history.value.push(findPage(url));
}

function urlBarEnter(event: KeyboardEvent) {
  navigate((event.target as HTMLInputElement).value);
}

function backwards() {
  history.value.pop();
}
</script>

<style lang="scss" scoped>
.browser-toolbar {
  display: flex;
  width: 100%;
  height: 50px;
  align-items: center;
  padding-left: 15px;
  background-color: #7575e8;
  border-left: 4px solid #b9b9ff;
  border-bottom: 4px solid #5c5cd5;
  border-right: 4px solid #5c5cd5;
}

.browser-content {
  height: calc(100% - 50px);
  width: 100%;
  overflow: hidden;
  background-color: #333362;
}
</style>