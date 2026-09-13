<script setup lang="ts">
import Header from './components/header.vue'
import Sidebar from './components/sidebar.vue'

</script>

<template>
  <div class="main">
    <Header></Header>
  
    <Sidebar></Sidebar>
    
    
    <main id="main">
    </main>
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
