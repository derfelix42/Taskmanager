<script setup lang="ts">
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import ButtonBar from '@/components/ButtonBar.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="main">
    <Header></Header>
  
    <Sidebar></Sidebar>
    
    
    <main id="main">
      <RouterView />
    </main>

    <ButtonBar></ButtonBar>
  </div>
</template>

<style>
div.main {
  display: grid;
  grid-template-columns: 1fr 9fr;
  grid-template-rows: 3em auto;
  grid-template-areas:
  "header header"
  "sidebar main";
  background-color: #222;
  color: white;
  height: 100vh;
  font-family: monospace;
}

main {
  grid-area: main;
  height: 100%;
  overflow: auto;
}

@media screen and (max-width: 600px) {
  body {
    grid-template-areas:
      "header header"
      "main main";
  }
}

</style>