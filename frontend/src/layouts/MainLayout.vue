<script setup lang="ts">
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import ButtonBar from '@/components/ButtonBar.vue'
import { RouterView } from 'vue-router'
import AddNewTaskModal from '@/components/AddNewTaskModal.vue';
import { ref } from 'vue';

let addNewTaskModalOpen = ref(false)

function openNewTaskModal() {
  addNewTaskModalOpen.value = true
  bgBlur.value = true
}

function closeModal() {
  console.log("Close Modal Event received!")
  addNewTaskModalOpen.value = false
  bgBlur.value = false
}

function handleEscapeKey() {
  console.log("ESCAPE!")
  if (addNewTaskModalOpen.value) {
    closeModal()
  }
}


let bgBlur = ref(false)

</script>

<template>
  <div class="main" @keyup.escape="handleEscapeKey()">
    <Header></Header>

    <Sidebar :class="{ 'blur-out': bgBlur }"></Sidebar>


    <main :class="{ 'blur-out': bgBlur }">
      <RouterView />
    </main>


    <ButtonBar @openNewTaskModal="openNewTaskModal"></ButtonBar>
    <AddNewTaskModal @close="closeModal" v-if="addNewTaskModalOpen"></AddNewTaskModal>
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