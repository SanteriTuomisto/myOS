<template>
  <div class="container">
    <div class="page" v-if="!searchOpen">
      <BoogleLogo />
      <div>
        <input
          type="text"
          v-model="value"
          placeholder="Search Boogle or type a URL"
          class="search"
          style="margin-top: 20px;"
          @keyup.enter="() => searchAction(value)"
        />
      </div>
      <div>
        <button @click="() => searchAction(value)">Search</button>
      </div>
    </div>
    <div v-else class="search-page">
      <div class="search-bar">
        <BoogleLogo />
        <div>
          <input
            type="text"
            v-model="value"
            placeholder="Search Boogle or type a URL"
            class="search"
            @keyup.enter="() => searchAction(value)"
          />
          <button @click="() => searchAction(value)">Search</button>
        </div>
      </div>
      <div class="results">
        <div>
          Did you mean: asdasd
        </div>
        <div>No results containing all your search terms were found.</div>
        <div>Your search - {{ searchedWord }} - did not match any documents.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BoogleLogo from './BoogleLogo.vue';

const value = ref('');
const searchOpen = ref(false);
const searchedWord = ref('');

function searchAction(searchValue: string) {
  if (searchValue !== '') {
    searchOpen.value = true;
    searchedWord.value = searchValue;
  } else {
    searchOpen.value = false;
    searchedWord.value = '';
  }
}
</script>

<style scoped lang="scss">
.container {
  height: 100%;
  width: 100%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.search {
  min-width: 250px;
  width: 70%;
  font-size: 17px;
}

.search-page {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.search-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  padding-left: 10px;
}

.results {
  color: black;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
}
</style>