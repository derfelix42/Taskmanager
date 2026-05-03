import { createApp, ref, reactive, computed, onMounted, watch, onBeforeUnmount } from 'vue'

const week_days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]

const day_view = createApp({
  setup() {
    const date = ref(new Date());
    const sun_times = ref({ sunrise: new Date(), sunset: new Date() })

    const date_string = computed(() => {
      let d = date.value
      return week_days[d.getDay()] + ", "
        + d.getDate().toString().padStart(2, "0") + "."
        + (d.getMonth() + 1).toString().padStart(2, "0") + "."
        + (d.getFullYear()).toString()
    })

    const week_string = computed(() => {
      var d = new Date(Date.UTC(date.value.getFullYear(), date.value.getMonth(), date.value.getDate()));
      var dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)

      return "KW-" + week.toString().padStart(2, "0") + "-" + d.getFullYear()
    })


    onMounted(async () => {
      const params = new URLSearchParams(location.search);
      // console.log(params)

      const d = new Date(); // today
      if (params.has('tomorrow')) d.setDate(d.getDate() + 1);
      if (params.has('yesterday')) d.setDate(d.getDate() - 1);
      if (params.has('date')) {
        const dateParam = params.get('date');
        d.setTime(Date.parse(dateParam))
      }
      date.value = d
      // console.log(d)

      fetchSun()
    })

    function nextDay() {
      goToDay(1)
    }

    function prevDay() {
      goToDay(-1)
    }

    function goToDay(dir) { // dir is +/-1
      let d = new Date(date.value)
      d.setDate(d.getDate() + dir)

      let date_string = "date=" + d.toLocaleDateString('sv-SE'); //toISOString().slice(0, 10);
      if (d.getDate() === (new Date()).getDate()) {
        date_string = "today"
      }
      if (d.getDate() - 1 === (new Date()).getDate()) {
        date_string = "tomorrow"
      }
      if (d.getDate() + 1 === (new Date()).getDate()) {
        date_string = "yesterday"
      }

      location.replace('/tasks.php?' + date_string);
    }

    async function fetchSun() {
      let data = await getSunTimes(date.value.toLocaleDateString('sv-SE'))
      const sunrise = new Date(data.sunrise);
      const sunset = new Date(data.sunset);
      let sun_data = {
        sunrise: sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sunset: sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      sun_times.value = sun_data
    }


    return {
      date_string, week_string, tasks, nextDay, prevDay, sun_times
    }
  },
  template: `
  <header>
    <div class="arrow left-arrow" @click="prevDay">
      <i class="fas fa-chevron-left"></i>
    </div>
    <div class="row top-row">{{week_string}}</div>
    <div class="row main-row">{{ date_string }}</div>
    <div class="row bottom-row">
      🌅 {{sun_times.sunrise}} / 🌇 {{sun_times.sunset}}
    
    </div>
    <div class="arrow right-arrow" @click="nextDay">
      <i class="fas fa-chevron-right"></i>
    </div>
  </header>
  `
})

if (document.getElementById("day_header")) {
  day_view.mount("#day_header")
}