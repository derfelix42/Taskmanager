<script setup lang="ts">
import { endTaskAPI, getCurrentlyActiveTask, getTaskData, stopTimerOnTask } from '@/api/api'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const currentTask = ref<any | null>(null)
const currentTime = ref(new Date())
const startStopBtn = ref('')

let fetchTimer: ReturnType<typeof setTimeout> | null = null

const title = computed(() => currentTask.value?.Name ?? '')

const timer = computed(() => {
  if (currentTask.value) {
    const seconds =
      Number(currentTask.value.time_spent ?? 0) +
      (currentTime.value.getTime() - new Date(currentTask.value.lastUpdate ?? Date.now()).getTime()) / 1000

    const secs = Math.floor(seconds % 60)
    const min = Math.floor((seconds / 60) % 60)
    const hour = Math.floor(seconds / 60 / 60)

    return [hour, min, secs]
      .map((value) => String(Math.floor(value)).padStart(2, '0'))
      .join(':')
  }

  const now = currentTime.value
  return [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
})

const getCurrentTask = async () => {
  currentTime.value = new Date()

  const currentTaskID = await getCurrentlyActiveTask()

  if (currentTaskID === -1) {
    currentTask.value = null
    startStopBtn.value = ''
  } else if (currentTask.value?.ID !== currentTaskID) {
    currentTask.value = await getTaskData(currentTaskID)
    currentTask.value.lastUpdate = new Date()
    startStopBtn.value = 'STOP'
  }

  fetchTimer = setTimeout(getCurrentTask, 1000)
}

async function openTaskModal() {
  if (currentTask.value?.ID != null) {
    openModal(currentTask.value.ID)
  }
}

async function apiStopTaskTimer() {
  if (currentTask.value?.ID != null) {
    await stopTimerOnTask(currentTask.value.ID)
  }
}

async function apiEndTask() {
  if (currentTask.value?.ID != null) {
    await endTaskAPI(currentTask.value.ID)
  }
}

onMounted(() => {
  void getCurrentTask()
})

onBeforeUnmount(() => {
  if (fetchTimer) {
    clearTimeout(fetchTimer)
  }
})
</script>

<template>
<header id="header">
    <p class="title" @click="openTaskModal">{{ title }}</p>
  
    <button
      v-if="startStopBtn"
      type="button"
      name="startStop"
      @click="apiStopTaskTimer"
    >
      {{ startStopBtn }}
    </button>
  
    <div class="time">{{ timer }}</div>
  
    <button type="button" name="endTask" @click="apiEndTask">
      BEENDEN
    </button>
  
    <div class="times">
      <!--
      <p class="startTime">start</p>
      <p class="endTime">ende</p>
      -->
    </div>

</header>
</template>

<style>
header {
  grid-area: header;
  background-color: #000;

  display: grid;
  grid-template-columns: 3fr 0.5fr 1.5fr 0.5fr 3fr;
}

header .title {
  line-height: 1.5rem;
  font-size: 1.2em;
  padding: 0.5rem;
  cursor: pointer;
}

header .time {
  text-align: center;
  height: 1.2em;
  line-height: 1.2em;
  background-color: #555;
  margin-bottom: 0.25em;
  font-size: 2em;
  color: white;
  margin: 0.2em;
}

header button {
  text-align: center;
  line-height: 1.2em;
  margin: 0.25em;
  font-size: 1em;
  color: white;
  height: 2em;

  border: 0;
  font-weight: bolder;
  background-color: RED;
}

header button[name="startStop"] {
}

header button[name="endTask"] {
  background-color: GREEN;
}

header .times {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

header .startTime {
  text-align: right;
  padding-right: 0.5em;
}

header .endTime {
  text-align: right;
  padding-right: 0.5em;
}

</style>