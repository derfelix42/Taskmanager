import { getTasksForDate } from '@/api/api'
import type { TaskResponse } from '@/models/tasks'
import { defineStore } from 'pinia'
import { onScopeDispose, reactive, ref, watch } from 'vue'
import { useCurrentDateStore } from './currentDateStore'



export const useTasksStore = defineStore('clock', () => {
    const currentDateStore = useCurrentDateStore()
    const now = ref(Date.now())

    let intervalId: ReturnType<typeof window.setInterval> | undefined

    function tick() {
        now.value = Date.now()
    }

    function start() {
        if (intervalId !== undefined) return

        tick()
        intervalId = window.setInterval(tick, 1_000)
    }

    function stop() {
        if (intervalId === undefined) return

        window.clearInterval(intervalId)
        intervalId = undefined
    }

    // const tasks = reactive<Record<string, TaskResponse[]>>({})

    // async function fetchTasks() {
    //     let res = await getTasksForDate(currentDateStore.isoDate)
    //     for (let i = 0; i < res.length; i++) {
    //         if (res[i].color === "#null") {
    //             res[i].color = "#777"
    //         }
    //     }
    //     tasks[currentDateStore.isoDate] = res
    // }

    // watch(() => currentDateStore.isoDate, () => fetchTasks())

    // fetchTasks()
    start()

    onScopeDispose(stop)

    return {
        now,
        start,
        stop,
        // tasks
    }
})