<template>
  <vue-resizable
    v-show="!minimized"
    @click="setActive"
    class="resizable"
    :class="{
      'active-window': active && !maximized,
      'active-full': active && maximized,
      'inactive-window': !active && !maximized,
      'inactive-full': !active && maximized,
    }"
    ref="resizableComponent"
    :dragSelector="dragSelector"
    :active="handlers"
    :fit-parent="fit"
    :maximize="maximized"
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
          <div @click.stop="maximizeWindow">
            <ExpandIcon class="icon" />
          </div>
          <div @click.stop="closeWindow">
            <XIcon class="icon" />
          </div>
        </div>
      </div>
      <div class="table-container">
        <slot />
      </div>
      <!-- <div class="drag-container-2">footer</div> -->
    </div>
  </vue-resizable>
</template>

<script>
import VueResizableModule from 'vue-resizable';
import { mapGetters } from 'vuex';
import XIcon from '@/assets/XIcon.vue';
import ExpandIcon from '@/assets/ExpandIcon.vue';
import MinimizeIcon from '@/assets/MinimizeIcon.vue';

// vue-resizable ships only a UMD build, whose default export ends up nested
const VueResizable = VueResizableModule.default || VueResizableModule;

export default {
  emits: ['click'],
  components: {
    VueResizable,
    XIcon,
    ExpandIcon,
    MinimizeIcon,
  },
  props: {
    id: Number,
    app: Object,
    index: Number,
    hideBottomBorder: {
      type: Boolean,
      default: false,
    },
    minW: {
      type: Number,
      default: 400,
    },
    minH: {
      type: Number,
      default: 250,
    },
    initWidth: {
      type: Number,
      default: 500,
    },
    initHeight: {
      type: Number,
      default: 350,
    },
  },
  created() {
    const activeId = this.getActiveWindowId;
    this.active = activeId === this.id;
    this.updateAppFromStore(this.app);
  },
  mounted() {
    this.updateApplicationToStore();
  },
  data() {
    const tW = this.initWidth;
    const tH = this.initHeight;
    const offset = this.index * 20;
    return {
      minimized: false,
      active: false,
      handlers: ["r", "rb", "b", "lb", "l", "lt", "t", "rt"],
      left: `calc(50% - ${tW / 2 - offset}px)`,
      top: `calc(50% - ${tH / 2 - offset}px)`,
      height: tH,
      width: tW,
      fit: true,
      maximized: false,
      event: "",
      dragSelector: ".drag-container-1",
    };
  },
  methods: {
    eHandler(data) {
      this.$store.dispatch('setActiveWindowId', this.id);
      this.width = data.width;
      this.height = data.height;
      this.left = data.left;
      this.top = data.top;
      this.event = data.eventName;
      if (data.eventName === 'drag:move') {
        this.maximized = false;
      }
      this.updateApplicationToStore();
    },
    minimizeWindow() {
      this.minimized = true;
      this.updateApplicationToStore();
      this.$store.dispatch('setActiveWindowId', null);
    },
    maximizeWindow() {
      this.maximized = !this.maximized;
      this.updateApplicationToStore();
    },
    closeWindow() {
      this.$store.dispatch('closeApplication', this.id);
    },
    setActive() {
      this.$store.dispatch('setActiveWindowId', this.id);
    },
    updateAppFromStore(app) {
      if (app.position?.top != null && app.position?.left != null) {
        this.top = app.position.top;
        this.left = app.position.left;
      }
      if (app.size?.width != null && app.size?.height != null) {
        this.width = app.size.width;
        this.height = app.size.height;
      }
      if (app.minimized != null) {
        this.minimized = app.minimized;
      }
      if (app.maximized != null) {
        this.maximized = app.maximized;
      }
    },
    updateApplicationToStore() {
      this.$store.dispatch('updateApplication', {
        id: this.id,
        type: this.app.type,
        minimized: this.minimized,
        maximized: this.maximized,
        position: {
          top: this.top,
          left: this.left,
        },
        size: {
          width: this.width,
          height: this.height,
        }
      }); 
    },
  },
  computed: {
    ...mapGetters({  
      getActiveWindowId: 'getActiveWindowId',
      getApplicationById: 'getApplicationById',
    }),
    getApp() {
      return this.getApplicationById(this.id);
    },
  },
  watch: {
    getActiveWindowId(activeId) {
      this.active = activeId === this.id;
    },
    getApp(app) {
      if (app) {
        this.updateAppFromStore(app);
      }
    },
  },
};
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
