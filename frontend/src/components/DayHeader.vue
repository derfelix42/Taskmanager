<script setup lang="ts">
import { getSunTimes } from '@/api/api'
import { createApp, ref, reactive, computed, onMounted, watch, onBeforeUnmount } from 'vue'
const week_days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]

defineEmits(['prevDay', 'nextDay', 'timetable'])
const props = defineProps(['date'])

const headerDate = reactive(props.date);
const sun_times = ref({ 
    sunrise: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
    sunset: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
})

const date_string = computed(() => {
    let d = props.date
    return week_days[d.getDay()] + ", "
    + d.getDate().toString().padStart(2, "0") + "."
    + (d.getMonth() + 1).toString().padStart(2, "0") + "."
    + (d.getFullYear()).toString()
})


const week_string = computed(() => {
    let date = props.date
    var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)

    return "KW-" + week.toString().padStart(2, "0") + "-" + d.getFullYear()
})


onMounted(async () => {
    fetchSun()
})


watch(() => props.date, () => fetchSun() )

async function fetchSun() {
    let data = await getSunTimes(props.date.toLocaleDateString('sv-SE'))
    const sunrise = new Date(data.sunrise);
    const sunset = new Date(data.sunset);
    let sun_data = {
        sunrise: sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sunset: sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    Object.assign(sun_times.value, sun_data)
}
</script>

<template>
    <header>
        <div class="arrow left-arrow" @click="$emit('prevDay')">
            <i class="fas fa-chevron-left"></i>
        </div>

        <div class="row top-row link" @click="$emit('timetable')">
            {{ week_string }}
        </div>

        <div class="row main-row">{{ date_string }}</div>

        <div class="row bottom-row">
            🌅 {{sun_times.sunrise}} / 🌇 {{sun_times.sunset}}
        </div>

        <div class="arrow right-arrow" @click="$emit('nextDay')">
            <i class="fas fa-chevron-right"></i>
        </div>
    </header>
</template>

<style scoped>
header {
    width: 30em;
    margin: 1em auto;
    border-radius: 0.5em;
    display: grid;
    grid-template-columns: 5em 20em 5em;
    grid-template-rows: 1fr 2fr 1fr;

    background-color: inherit;

}

.left-arrow {
    grid-column: 1;
    grid-row: 1 / 4;
    text-align: left;
}

.right-arrow {
    grid-column: 3;
    grid-row: 1 / 4;
    text-align: right;
}

.top-row {
    grid-column: 2;
    grid-row: 1;
}

.main-row {
    grid-column: 2;
    grid-row: 2;
    font-size: 2em;
}

.bottom-row {
    grid-column: 2;
    grid-row: 3;
}

.arrow {
    font-size: 2em;
    margin: auto;
    cursor: pointer;
}

.row {
    text-align: center;
    padding: 0.25em;
}

main input {
    width: auto;
}

.link {
    cursor: pointer;
}
</style>