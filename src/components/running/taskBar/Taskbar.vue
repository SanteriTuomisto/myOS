<template>
  <StartMenu :showStartMenu="getShowStartMenu" />
  <div class="start-menu-backdrop"
    v-if="getShowStartMenu"
    @click="hideStartMenu"  
  >
  </div>
  <div id="taskbar">
    <div class="start-menu-btn"
      @click="startButtonClick" 
    >
      Start
    </div>
    <div class="taskbarItems"
    >
      <TaskbarItem
        v-for="app in applications" :key="app.id"
        :id="app.id"
        :app="app"
      />
    </div>
    <div id="datetime">
      <div>
        <WifiIcon style="width: 20px; margin: 8px;" />
      </div>
      <div class="time">{{ time }}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import WifiIcon from '@/assets/WifiIcon.vue';
import StartMenu from './StartMenu.vue';
import TaskbarItem from './TaskbarItem.vue';

export default {
  components: {
    StartMenu,
    TaskbarItem,
    WifiIcon,
  },
  data() {
    return {
      date: null,
      time: null,
      getDateInterval: null,
      applications: [],
    };
  },
  mounted() {
    this.applications = this.getApplications;
    this.getDate();
    this.getDateInterval = setInterval(() => {
      this.getDate();
    }, 1000);
  },
  unmounted() {
    clearInterval(this.getDateInterval);
  },
  methods: {
    getDate() {
      const now = new Date();
      this.time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    },
    startButtonClick() {
      this.$store.dispatch('toggleStartMenu');
    },
    hideStartMenu() {
      this.$store.dispatch('toggleStartMenu');
    },
  },
  computed: {
    ...mapGetters({  
      getApplications: 'getApplications',
    }),
    getShowStartMenu() {
      return this.$store.state.showStartMenu;
    },
  },
  watch: {
    getApplications(apps) {
      this.applications = apps;
    },
  },
};
</script>

<style scoped lang="scss">
  #taskbar {
    flex-shrink: 0;
    height: 42px;
    width: 100%;
    background-color: #8080ff;
    border-top: 4px solid #b9b9ff;
    display: flex;
    justify-content: space-between;
    color: #ffff00;
    font-weight: bold;
  }
  
  .start-menu-btn {
    z-index: 2;
    width: 128px;
    background-color: #b9b9ff;
    border-left: 4px solid #b9b9ff;
    border-bottom: 4px solid #5c5cd5;
    border-right: 4px solid #5c5cd5;
    font-style: italic;
    font-variant: small-caps;
    font-size: 24px;
    user-select: none;
    padding-left: 8px;
    line-height: 40px;
  }

  .start-menu-btn:active {
    background-color: #5c5cd5;
    box-shadow: inset 1px 1px 0px 1px #000000;
  }

  .start-menu-backdrop {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .taskbarItems {
    display: flex;
    width: 100%;
    overflow: hidden;
  }

  #datetime {
    box-shadow: inset 1px 1px 0px 1px #000000;
    text-align: center;
    display: flex;
    background-color: #5c5cd5;
    margin: 4px;
    padding-left: 5px;
    padding-right: 5px;
  }

  .time {
    width: 60px;
    height: 34px;
    vertical-align: baseline;
    line-height: 34px;
    user-select: none;
  }
</style>