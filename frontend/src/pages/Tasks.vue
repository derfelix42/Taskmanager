<script setup lang="ts">
import { endTaskAPI, getSunTimes, getTasksForDate } from '@/api/api'
import DayHeader from '@/components/DayHeader.vue'
import TaskList from '@/components/TaskList.vue'
import { compareDates } from '@/helpers'
import type { TaskResponse } from '@/models/tasks'
import router from '@/router'
import { useCurrentDateStore } from '@/stores/currentDateStore'
import { storeToRefs } from 'pinia'
import { createApp, ref, reactive, computed, onMounted, watch, onBeforeUnmount } from 'vue'
const week_days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]

import { useRoute } from 'vue-router'

const route = useRoute()
const dateParam = computed(() => String(route.params.date))

const currentDateStore = useCurrentDateStore()
const dateStore = storeToRefs(currentDateStore)
const date = dateStore.date

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
    console.log("goToDay", d, currDate, compareDates(d, currDate), new_date_string)
    router.push({ name: 'tasks', params: { date: new_date_string } })
}

let tasks = reactive<TaskResponse[]>([])

async function fetchTasks() {
    let res = await getTasksForDate(currentDateStore.isoDate)
    for (let i = 0; i < res.length; i++) {
        if (res[i].color === "null") {
            res[i].color = "777"
        }
    }
    console.log(res)
    tasks.splice(0)
    Object.assign(tasks, res)
}

watch(() => currentDateStore.isoDate, () => fetchTasks())

function openModal(taskID: number) {
    console.log("TODO: open TaskModal with ID: ", taskID)
}

async function setTaskDone(taskId: number) {
    console.log("TODO: set Task done with ID: ", taskId)
    await endTaskAPI(String(taskId)) // TODO: this is not the right function (stops task session, not only sets to done)
    await fetchTasks()
}


onMounted(() => {
    fetchTasks()
})

</script>

<template>
    <DayHeader :date="date" @prevDay="prevDay" , @nextDay="nextDay" @timetable="goToTimetable"></DayHeader>
    <TaskList title="Open Tasks" :tasks="tasks.filter((task) => task.done_timestamp === null)" @openModal="openModal"
        @setTaskDone="setTaskDone"></TaskList>
    <TaskList title="Done Tasks" :tasks="tasks.filter((task) => task.done_timestamp !== null)" @openModal="openModal"
        @setTaskDone="setTaskDone"></TaskList>
</template>

<style></style>