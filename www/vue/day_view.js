import { createApp, ref, reactive, computed, onMounted, watch, onBeforeUnmount } from 'vue'

const week_days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]

const day_view = createApp({
  setup() {
    const date = ref(new Date());
    const tasks = reactive([]);

    watch(date, async (newDate) => {
      tasks.splice(0)
      const new_data = await getTasksForDate(newDate.toISOString().slice(0, 10))
      Object.assign(tasks, new_data)
    })
    

    const date_string = computed(() => {
      let d = date.value
      return week_days[d.getDay()]+", "
        +d.getDate().toString().padStart(2, "0")+"."
        +(d.getMonth()+1).toString().padStart(2, "0")+"."
        +(d.getFullYear()).toString()
    })

    const week_string = computed(() => {
      var d = new Date(Date.UTC(date.value.getFullYear(), date.value.getMonth(), date.value.getDate()));
      var dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      const week = Math.ceil((((d - yearStart) / 86400000) + 1)/7)
    
      return "KW-"+week.toString().padStart(2, "0")+"-"+d.getFullYear()
    })


    onMounted(async () => {
      const new_data = await getTasksForDate(date.value.toISOString().slice(0, 10))
      Object.assign(tasks, new_data)

    })

    function nextDay() {
      console.log("nextDay!")
      let d = new Date(date.value)
      d.setDate(d.getDate()+1)
      date.value = d
    }

    function prevDay() {
      console.log("prevDay!")
      let d = new Date(date.value)
      d.setDate(d.getDate()-1)
      date.value = d
    }

    function secondsToTime(s) {
      const minutes = Math.floor(s / 60 % 60)
      const hours = Math.floor(s / 60 / 60)
      return hours+":"+minutes.toString().padStart(2,"0");
    }


    return {
      date_string, week_string, tasks, nextDay, prevDay, secondsToTime
    }
  },
  template: `
  <header>
    <div class="arrow left-arrow" @click="prevDay">
      <i class="fas fa-chevron-left"></i>
    </div>
    <div class="row top-row">{{week_string}}</div>
    <div class="row main-row">{{ date_string }}</div>
    <div class="row bottom-row"></div>
    <div class="arrow right-arrow" @click="nextDay">
      <i class="fas fa-chevron-right"></i>
    </div>
  </header>
  <main>
    <div v-for="task in tasks" :key="task.ID">
      <input type="checkbox" :checked="task.done !== null">
      <div class="categoryIndicator" :style="'--color: #'+(task.color||'777')"></div>
      {{ task.Name }}
      ({{secondsToTime(task.time_spent)}}) [{{task.difficulty}}]
    </div>
  </main>
  <aside></aside>
  `
})

day_view.mount("#day_view")