<template>
  <div class="search">
    <input
      type="text"
      maxlength="1000"
      required
      placeholder="search in github"
      @input="input"
    />
  </div>
  <div v-if="isLoading">Loading...</div>
  <ul>
    <li v-for="item in list.items" :key="item.id">
      <h4>
        <a :href="item.owner.html_url">{{ item.owner.login }}</a>
        <span>/</span>
        <a :href="item.url">{{ item.name }}</a>
      </h4>
      <p>{{ item.description }}</p>
      <p>
        <span>fork {{ item.forks }}</span>
        <span>star {{ item.stargazers_count }}</span>
        <span>watch {{ item.watchers_count }}</span>
      </p>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useObservable, useDOMEvent } from "./utils/rxHelper";
import {
  debounceTime,
  distinctUntilChanged,
  mergeMap,
  switchMap,
  tap,
} from "rxjs/operators";

function getRepos(query: string) {
  const SEARCH_REPOS =
    "https://api.github.com/search/repositories?sort=stars&order=desc&q=";

  return fetch(`${SEARCH_REPOS}${query}`).then((res) => res.json());
}

export default defineComponent({
  setup() {
    const isLoading = ref(false);
    const { subject: input$, callback: input } = useDOMEvent();
    const list = useObservable(
      input$.pipe(
        tap(() => (isLoading.value = true)),
        debounceTime(400),
        switchMap(async (e: any) => (e.target as HTMLInputElement).value),
        distinctUntilChanged(),
        mergeMap(getRepos),
        tap(() => (isLoading.value = false))
      ),
      ""
    );

    return { list, input, isLoading };
  },
});
</script>

<style>
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.search {
  width: 400px;
  height: 30px;
  line-height: 30px;
  padding: 2px 5px;
  margin: 1rem 0;
  border-radius: 4px;
  border: 1px solid #6b6b6b;
}
.search input {
  width: 100%;
  height: inherit;
  outline: none;
  border: none;
  background: transparent;
}
.search input::placeholder {
  background: transparent;
}

ul {
  padding-left: 0;
}
li {
  list-style: none;
  width: 500px;
  padding: 2px 26px;
  margin-bottom: 1rem;
  border-radius: 10px;

  box-shadow: 0 0 10px rgb(0 0 0 / 20%);
}

p > span {
  font-size: 14px;
  color: #8d8d8d;
  margin-right: 1rem;
}

a {
  color: #000;
  text-decoration: none;
}
</style>
