<script setup lang="ts">
import { getSunTimes } from '@/api/api'
import DayHeader from '@/components/DayHeader.vue'
import { compareDates } from '@/helpers'
import router from '@/router'
import { createApp, ref, reactive, computed, onMounted, watch, onBeforeUnmount } from 'vue'
const week_days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]

import { useRoute } from 'vue-router'

const route = useRoute()
const dateParam = computed(() => String(route.params.date))

const date = ref(new Date());

function getDateFromParam() {
    let param = String(route.params.date)
    const d = new Date(); // today
    if (param.includes('tomorrow')){
        d.setDate(d.getDate() + 1);
    } else if (param.includes('yesterday')) {
         d.setDate(d.getDate() - 1);
    } else if (!param.includes('today')) {
        d.setTime(Date.parse(param))
    }
    console.log("getDateFromParam", d)
    date.value = d
}

watch(() => route.params.date, () => getDateFromParam() )


onMounted(async () => {
    getDateFromParam()
})

function goToTimetable() {
    router.push({ name: 'timetable', params: { date: date.value.toLocaleDateString('sv-SE') } })
}

function nextDay() {
    goToDay(1)
}

function prevDay() {
    goToDay(-1)
}

function goToDay(dir: number) { // dir is +/-1
    let d = new Date(date.value)
    d.setDate(d.getDate() + dir)

    const currDate = new Date();

    let new_date_string = d.toLocaleDateString('sv-SE');
    if (compareDates(d, currDate) === 0) {
        new_date_string = "today"
    }
    if (compareDates(d, currDate) === 1) {
        new_date_string = "tomorrow"
    }
    if (compareDates(d, currDate) === -1) {
        new_date_string = "yesterday"
    }

    router.push({ name: 'tasks', params: { date: new_date_string } })
}
</script>

<template>
    <DayHeader :date="date" @prevDay="prevDay", @nextDay="nextDay" @timetable="goToTimetable"></DayHeader>
</template>

<style>
</style>