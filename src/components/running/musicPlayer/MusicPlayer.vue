<template>
  <div class="player">
    <div class="songs">
      <div
        v-for="(song, index) in songs"
        :key="index"
        class="song"
        @click="() => selectSong(song)"
      >
        <div style="width: 50%;">
          {{ song.name }}
        </div>
        <div style="width: 50%;">
          {{ song.artist }}
        </div>
        <div style="width: 50px;">
          {{ song.length }}
        </div>
      </div>
    </div>
    <div class="tool-wrapper">
      <div class="tools">
        <div style="width: 30px; height: 30px;">
          <ArrowLeft />
        </div>
        <div @click="play" :class="getPlayButtonClass">
          <MusicIcon style="width: 50px; height: 50px;" />
        </div>
        <div style="width: 30px; height: 30px;">
          <ArrowLeft style="transform: rotate(180deg);"/>
        </div>
      </div>
      <div class="np">
        <div class="np-text">
          <div>{{ currentSong?.artist }}</div>
          <div>-</div>
          <div>{{ currentSong?.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ArrowLeft from '@/assets/ArrowLeft.vue';
import MusicIcon from '@/assets/MusicIcon.vue';

interface Song {
  artist: string;
  name: string;
  filename: string;
  length: string;
}

export default defineComponent({
  components: {
    ArrowLeft,
    MusicIcon,
  },
  data(): {
    currentSongEl: HTMLAudioElement | undefined;
    currentSong: Song | undefined;
    isPlaying: boolean;
    songs: Song[];
  } {
    return {
      currentSongEl: undefined,
      currentSong: undefined,
      isPlaying: false,
      songs: [
        // { artist: 'Test', name: 'Kyösti', filename: 'kyostidemoni.mp3', length: '3:00' }
      ],
    };
  },
  methods: {
    selectSong(song: Song) {
      if (this.currentSongEl != null && !this.currentSongEl.paused) {
        this.currentSongEl.pause();
        this.isPlaying = false;
      }
      this.currentSong = song;
      this.currentSongEl = new Audio(new URL(`../../../assets/music/${song.filename}`, import.meta.url).href);
    },
    play() {
      if (!this.currentSongEl) {
        return;
      }
      if (this.currentSongEl.paused) {
        this.isPlaying = true;
        this.currentSongEl.play();
      } else {
        this.isPlaying = false;
        this.currentSongEl.pause();
      }
    },
  },
  computed: {
    getPlayButtonClass() {
      if (this.currentSongEl == null) {
        return 'play-button-disabled';
      }
      if (this.isPlaying) {
        return 'play-button-playing';
      }
      return 'play-button';
    },
  }
});
</script>

<style scoped lang="scss">
.player {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #2b2b64e6;
}

.songs {
  padding-top: 4px;
  height: 100%;
}

.song {
  height: 50px;
  background-color: #8080ff6e;
  display: flex;
  align-items: center;
  padding: 0px 20px;
  cursor: pointer;
  user-select: none;
}

.np {
  display: flex;
  background: #8080ff85;
  border-top: 4px solid #b8b8ff;
  border-left: 4px solid #b8b8ff;
  border-right: 4px solid #5c5cd5;
  border-bottom: 4px solid #5c5cd5;
  font-size: 20px;
  user-select: none;
  height: 35px;
  width: 100%;
  overflow: hidden;
}
.np-text {
  display: flex;
  gap: 10px;
  animation: 10s infinite linear slidein;
}

@keyframes slidein {
  0% {
    margin-left: 0%;
  }
  to {
    margin-left: 100%;
  }
}

.tool-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.tools {
  max-width: 700px;
  width: 100%;
  margin: 25px 10px 2px;
  border-radius: 50%;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #8080ff;
  border-top: 20px solid #b8b8ff;
  border-left: 20px solid #b9b9ff;
  border-right: 20px solid #5c5cd5;
  border-bottom: 20px solid #5c5cd5;
  cursor: pointer;
  gap: 30px;
}

.play-button {
  height: 120px;
  width: 120px;
  border-radius: 50%;
  background: #8080ff;
  border-top: 4px solid #b8b8ff;
  border-left: 4px solid #b9b9ff;
  border-right: 4px solid #5c5cd5;
  border-bottom: 4px solid #5c5cd5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  &-disabled {
    @extend .play-button;
    background-color: #35304e;
    color: #b8b8ff;
  }

  &-playing {
    @extend .play-button;
    border-top: 4px solid #5c5cd5;
    border-left: 4px solid #5c5cd5;
    border-right: 4px solid #b9b9ff;
    border-bottom: 4px solid #b9b9ff;
  }
}
</style>