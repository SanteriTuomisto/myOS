<template>
  <vue-resizable
    v-show="!minimized"
    @click="setActive"
    class="resizable"
    :class="active ? 'active' : 'inactive'"
    ref="resizableComponent"
    :dragSelector="dragSelector"
    :active="handlers"
    :fit-parent="fit"
    :maximize="maximized"
    :min-width="minW || checkEmpty"
    :min-height="minH || checkEmpty"
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
        <table>
          <tr>
            <td>id:{{ id }}</td>
            <td>index:{{ index }}</td>
            <td>activeId:{{ $store.getters.getActiveWindowId }}</td>
          </tr>
          <tr>
            <td>w:{{ width }}</td>
            <td>h:{{ height }}</td>
          </tr>
          <tr>
            <td>l:{{ left }}</td>
            <td>t:{{ top }}</td>
          </tr>
          <tr>
            <td>max:{{ maximized }}</td>
            <td>min:{{ minimized }}</td>
          </tr>
        </table>
      </div>
      <!-- <div class="drag-container-2">footer</div> -->
    </div>
  </vue-resizable>
</template>

<script>
import VueResizable from 'vue-resizable';
import { mapGetters } from 'vuex';
import XIcon from '@/assets/XIcon.vue';
import ExpandIcon from '@/assets/ExpandIcon.vue';
import MinimizeIcon from '@/assets/MinimizeIcon.vue';

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
    const tW = 350;
    const tH = 250;
    const offset = this.index * 20;
    return {
      minimized: false,
      active: false,
      handlers: ["r", "rb", "b", "lb", "l", "lt", "t", "rt"],
      left: `calc(50% - ${tW / 2 - offset}px)`,
      top: `calc(50% - ${tH / 2 - offset}px)`,
      height: tH,
      width: tW,
      minW: 300,
      minH: 150,
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
    checkEmpty(value) {
      return typeof value !== "number" ? 0 : value;
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

<style scoped>
  .active {
    z-index: 1;
    border-top: 4px solid #004080;
    border-left: 4px solid #004080;
    border-right: 4px solid #000080;
    border-bottom: 4px solid #000080;
    box-shadow: 2px 2px 0px 2px #000000;
  }

  .inactive {
    border-top: 4px solid #5f7b97;
    border-left: 4px solid #5f7b97;
    border-right: 4px solid #393983;
    border-bottom: 4px solid #393983;
    z-index: 0;
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
    background-color: #8000ff;
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
    border-top: 4px solid #b9b9ff;
    border-left: 4px solid #b9b9ff;
    border-bottom: 4px solid #5c5cd5;
    border-right: 4px solid #5c5cd5;
    color: #ffff00;
    font-weight: bold;
    text-align: left;
    display: flex;
    user-select: none;
    justify-content: space-between;
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
  }
</style>
