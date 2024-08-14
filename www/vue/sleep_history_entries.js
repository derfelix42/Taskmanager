import { createApp, ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

const sleep_history_entries = createApp({
    setup() {
        const entries = [
            {start: "Mo, 12.08.2024 22:00:00", stop: "Di, 13.08.2024 06:00:00"},
            {start: "Mo, 12.08.2024 22:00:00", stop: "Di, 13.08.2024 06:00:00"},
            {start: "Mo, 12.08.2024 22:00:00", stop: "Di, 13.08.2024 06:00:00"},
        ]

        async function fetchSleepHistory() {
            const times = await getWakeupTimes((new Date()))
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
            <span>{{entry.start}}</span>
            ->
            <span>{{entry.stop}}</span>
            (8:00)
        </div>
        `
    })
    
sleep_history_entries.mount("#sleep_history_entries")