import { createApp, ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

const sleep_history_entries = createApp({
    setup() {
        const entries = reactive([])

        async function fetchSleepHistory() {
            const times = await getWakeupTimes((new Date()))
            Object.assign(entries, times.data)
            console.log("Sleep History:",times)
        }

        onMounted(async () => {
            fetchSleepHistory()
        })

        return {
            entries
        }

    },
    template: `
        <div class="entry clickable" v-for="entry in entries" :key="entry.start">
            <span>{{entry.start_time}}</span>
            ->
            <span>{{entry.stop_time}}</span>
            ({{entry.sleep_hours}})
        </div>
        `
    })
    
sleep_history_entries.mount("#sleep_history_entries")