<template>
  <vue-resizable
    v-show="!minimized"
    @click="setActive"
    class="resizable"
    :class="{
      'active-window': active && !fullScreen,
      'active-full': active && fullScreen,
      'inactive-window': !active && !fullScreen,
      'inactive-full': !active && fullScreen,
      mobile,
    }"
    ref="resizableComponent"
    :dragSelector="mobile ? NO_DRAG : '.drag-container-1'"
    :active="mobile ? [] : handlers"
    :fit-parent="true"
    :maximize="fullScreen"
    :min-width="minW"
    :min-height="minH"
    :width="width"
    :height="height"
    :left="left"
    :top="top"
    @mount="eHandler"
    @resize:move="eHandler"
    @resize:start="eHandler"
    @resize:end="eHandler"
    @drag:move="eHandler"
    @drag:start="eHandler"
    @drag:end="eHandler"
    @maximize="onMaximize"
  >
    <div class="block">
      <div class="drag-container-1"
        :class="{
          'bottom-border': !hideBottomBorder,
        }"
        @dblclick="maximizeWindow"
      >
        <div>{{ app.name }}</div>
        <div class="topbar-buttons">
          <div @click.stop="minimizeWindow">
            <MinimizeIcon class="icon" />
          </div>
          <div v-if="!mobile" @click.stop="maximizeWindow">
            <ExpandIcon class="icon" />
          </div>
          <div @click.stop="closeWindow">
            <XIcon class="icon" />
          </div>
        </div>
      </div>
      <div class="table-container">
        <slot :interactive="active && !interacting" />
      </div>
      <!-- <div class="drag-container-2">footer</div> -->
    </div>
  </vue-resizable>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import VueResizableModule from 'vue-resizable';
import XIcon from '@/assets/XIcon.vue';
import ExpandIcon from '@/assets/ExpandIcon.vue';
import MinimizeIcon from '@/assets/MinimizeIcon.vue';
import type { Application, Position } from '@/types';
import { useApplicationsStore } from '@/stores/applications';
import { useSmallScreen } from '@/composables/useSmallScreen';

// vue-resizable ships only a UMD build, whose default export ends up nested
const VueResizable = 'default' in VueResizableModule ? VueResizableModule.default : VueResizableModule;

/** The parts of the vue-resizable instance that onMaximize sets. */
interface ResizableInternals {
  $el: HTMLElement;
  w: number;
  h: number;
  l: number;
  t: number;
}

interface ResizableEvent {
  eventName: string;
  /** The vue-resizable instance */
  cmp?: unknown;
  left: Position['left'];
  top: Position['top'];
  width: number;
  height: number;
}

const props = withDefaults(defineProps<{
  app: Application;
  index?: number;
  hideBottomBorder?: boolean;
  minW?: number;
  minH?: number;
  initWidth?: number;
  initHeight?: number;
}>(), {
  index: 0,
  hideBottomBorder: false,
  minW: 400,
  minH: 250,
  initWidth: 500,
  initHeight: 350,
});

const applications = useApplicationsStore();
const { activeWindowId } = storeToRefs(applications);

const handlers = ['r', 'rb', 'b', 'lb', 'l', 'lt', 't', 'rt'];
// vue-resizable needs a valid selector; this one matches nothing, so nothing can be dragged
const NO_DRAG = '.no-drag';

// On phones every window is shown full screen and can't be moved or resized. This only
// changes how it's shown: the saved size, position and maximized state stay as they were,
// so a wide screen gets the normal windows back.
const mobile = useSmallScreen();
const offset = props.index * 20;

// Position and size are owned by vue-resizable while dragging, and pushed to the store after each change
const width = ref(props.app.size?.width ?? props.initWidth);
const height = ref(props.app.size?.height ?? props.initHeight);
const left = ref<Position['left']>(props.app.position?.left ?? `calc(50% - ${props.initWidth / 2 - offset}px)`);
const top = ref<Position['top']>(props.app.position?.top ?? `calc(50% - ${props.initHeight / 2 - offset}px)`);

const active = computed(() => activeWindowId.value === props.app.id);
const minimized = computed(() => props.app.minimized);
const maximized = computed(() => props.app.maximized);
const fullScreen = computed(() => maximized.value || mobile.value);
// True during a drag or resize
const interacting = ref(false);

function updateApplicationToStore(changes: Partial<Pick<Application, 'minimized' | 'maximized'>> = {}) {
  applications.updateApplication(props.app.id, {
    position: { top: top.value, left: left.value },
    size: { width: width.value, height: height.value },
    ...changes,
  });
}

function eHandler(data: ResizableEvent) {
  // Mounting (opening, or restoring windows after a reload) keeps the saved active window
  if (data.eventName !== 'mount' && !minimized.value) {
    applications.setActiveWindow(props.app.id);
  }
  // The full-screen geometry isn't the window's real size; don't save it
  if (mobile.value) {
    return;
  }
  interacting.value = data.eventName.endsWith(':start') || data.eventName.endsWith(':move');
  width.value = data.width;
  height.value = data.height;
  left.value = data.left;
  top.value = data.top;
  updateApplicationToStore(data.eventName === 'drag:move' ? { maximized: false } : {});
}

// Leaving full screen: vue-resizable puts back the geometry it saw when the window went full
// screen. For a window opened on a phone that's the phone-sized one, so set the real saved
// size and position instead, kept on screen.
function onMaximize(data: ResizableEvent & { state: boolean }) {
  const resizable = data.cmp as ResizableInternals | undefined;
  const parent = resizable?.$el.parentElement;
  if (data.state || mobile.value || !resizable || !parent) {
    return;
  }
  const keepInside = (value: number, size: number, room: number) => Math.min(Math.max(value, 0), Math.max(room - size, 0));
  // Never-moved windows have a centering calc() position; work it out in pixels
  const centered = (size: number, room: number) => (room - size) / 2 + offset;
  const l = keepInside(typeof left.value === 'number' ? left.value : centered(width.value, parent.clientWidth), width.value, parent.clientWidth);
  const t = keepInside(typeof top.value === 'number' ? top.value : centered(height.value, parent.clientHeight), height.value, parent.clientHeight);
  Object.assign(resizable, { w: width.value, h: height.value, l, t });
  left.value = l;
  top.value = t;
  updateApplicationToStore();
}

function minimizeWindow() {
  updateApplicationToStore();
  applications.minimizeWindow(props.app.id);
}

function maximizeWindow() {
  if (mobile.value) {
    return;
  }
  updateApplicationToStore({ maximized: !maximized.value });
}

function closeWindow() {
  applications.closeApplication(props.app.id);
}

function setActive() {
  applications.setActiveWindow(props.app.id);
}

onMounted(() => {
  updateApplicationToStore();
});
</script>

<style scoped lang="scss">
  .active-window {
    z-index: 1;
    border-top: 4px solid #004080;
    border-left: 4px solid #004080;
    border-right: 4px solid #000080;
    border-bottom: 4px solid #000080;
    box-shadow: 2px 2px 0px 2px #000000;
  }

  .active-full {
    z-index: 1;
  }

  .inactive-window {
    border-top: 4px solid #5f7b97;
    border-left: 4px solid #5f7b97;
    border-right: 4px solid #393983;
    border-bottom: 4px solid #393983;
    z-index: 0;
    // opacity: 0.9;
  }

  .inactive-full {
    z-index: 0;
    // opacity: 0.9;
  }

  .topbar-buttons {
    display: flex;
    width: 70px;
    justify-content: space-between;
  }

  .topbar-buttons > div {
    width: 20px;
    text-align: center;
  }

  .icon {
    height: 16px;
  }

  // Bigger targets for fingers; there's no maximize button on phones
  .mobile .topbar-buttons {
    width: auto;
    gap: 12px;
  }

  .mobile .topbar-buttons > div {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 28px;
  }

  .mobile .icon {
    height: 22px;
  }

  .block {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .resizable {
    background-position: top left;
    width: 350px;
    height: 250px;
    padding: 0;
    color: #ffffff;
    position: absolute !important;
  }

  .table-block {
    display: table;
  }

  .table-row {
    display: table-row;
    text-align: center;
  }

  .drag-container-1,
  .drag-container-2 {
    padding: 7px 7px;
    background: #8080ff;
    border-top: 4px solid hsl(240, 100%, 86%);
    border-left: 4px solid #b9b9ff;
    border-right: 4px solid #5c5cd5;
    color: #ffff00;
    font-weight: bold;
    text-align: left;
    display: flex;
    user-select: none;
    justify-content: space-between;
  }

  .bottom-border {
    border-bottom: 4px solid #5c5cd5;
  }

  .drag-container-1 {
    cursor: pointer;
  }

  .table-container {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: calc(100% - 40px);
  }
</style>
