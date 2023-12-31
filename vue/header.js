import { createApp, ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

const header = createApp({
  setup() {
    let fetch_timer;
    const currentTask = reactive({})
    const currentTime = ref(new Date())

    const title = computed(() => currentTask.value?.Name || "")
    const startStopBtn = ref("")
    const timer = computed(() => {
      if (currentTask.value) {
        let seconds = parseInt(currentTask.value.time_spent) + ((currentTime.value - currentTask.value?.lastUpdate) / 1000)
        let secs = Math.floor(seconds % 60)
        let min = Math.floor(seconds / 60 % 60)
        let hour = Math.floor(seconds / 60 / 60)

        return String(hour.toFixed(0)).padStart(2, "0") + ":"
          + String(min.toFixed(0)).padStart(2, "0") + ":"
          + String(secs.toFixed(0)).padStart(2, "0")
      } else {
        let currTime = currentTime.value
        return String(currTime.getHours()).padStart(2, "0") + ":"
          + String(currTime.getMinutes()).padStart(2, "0") + ":"
          + String(currTime.getSeconds()).padStart(2, "0")
      }
    })

    const getCurrentTask = async () => {
      currentTime.value = new Date()
      const currentTaskID = await getCurrentlyActiveTask()
      if (currentTaskID === -1) {
        currentTask.value = undefined
        startStopBtn.value = ""
      } else if (currentTask.value?.ID !== currentTaskID) {
        currentTask.value = await getTaskData(currentTaskID)
        currentTask.value.lastUpdate = new Date()
        startStopBtn.value = "STOP"
      }

      fetch_timer = setTimeout(getCurrentTask, 1000)
    }

    async function openTaskModal() {
      openModal(currentTask.value?.ID)
    }

    async function apiStopTaskTimer() {
      await stopTimerOnTask(currentTask.value?.ID)
    }

    async function apiEndTask() {
      await endTaskAPI(currentTask.value?.ID)
    }

    onMounted(async () => {
      console.log("header is mounted!")
      await getCurrentTask()
      console.log("Got current Task!", currentTask)
    })

    onBeforeUnmount(() => clearTimeout(fetch_timer))

    return {
      currentTask, title, startStopBtn, timer, apiStopTaskTimer, apiEndTask, openTaskModal
    }
  },
  template: `
  <p class="title" @click="openTaskModal">{{ title }}</p>
  <button type="button" name="startStop" @click="apiStopTaskTimer">{{ startStopBtn }}</button>
  <div class="time">{{ timer }}</div>
  <button type="button" name="endTask" @click="apiEndTask">BEENDEN</button>
  <div class="times">
    <!--<p class="startTime">start</p>
    <p class="endTime">ende</p>-->
  </div>
  `
})

header.mount("#header")