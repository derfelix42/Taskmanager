<script setup lang="ts">
import { getStatistics, type StatisticsResponse } from '@/api/api'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const data = ref<StatisticsResponse | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const timeframe = computed(() => typeof route.params.timeframe === 'string' ? route.params.timeframe : undefined)
const offset = computed(() => {
    const value = route.params.offset
    return typeof value === 'string' && value !== '' ? Number(value) : undefined
})

const hours_in_timeframe = computed(() => {
    if (timeframe.value === "DAY") {
        return 24
    }
    if (timeframe.value === "WEEK") {
        return 168
    }
    if (timeframe.value === "MONTH") {
        return 30 * 24
    }
    return 0
})

async function loadStatistics() {
    loading.value = true
    error.value = null
    try {
        data.value = await getStatistics(timeframe.value, offset.value)
    } catch (requestError) {
        error.value = requestError instanceof Error ? requestError.message : 'Could not load statistics'
    } finally {
        loading.value = false
    }
}

function format_time(hours: number) {
    let time_string = "-"
    let seconds = hours * 3600 % 60
    let minutes = Math.floor(hours * 60 % 60)
    hours = Math.floor(hours)

    if (seconds > 0) {
        time_string = seconds + " seconds";
    }
    if (minutes > 0) {
        time_string = minutes + " minutes, " + time_string;
    }
    if (hours > 0) {
        time_string = hours + " hours, " + time_string;
    }
    return time_string
}

onMounted(loadStatistics)
watch([timeframe, offset], loadStatistics)

</script>

<template>
    <h2>Statistics</h2>
    <p v-if="loading">Loading statistics...</p>
    <p v-else-if="error">{{ error }}</p>
    <template v-else-if="data">
        <section class="statistics">
            <div class="wide">
                <header style='--color: #111'>Instance Statistics</header>
                <main>
                    <section>
                        <h3>Overall</h3>
                        <p>Number of Tasks created: {{ data.overall.tasks_created }}</p>
                        <p>Tracked hours: {{ format_time(data.overall.tracked_hours) }}</p>
                    </section>

                    <section>
                        <h3>This Year</h3>
                        <p>Number of Tasks created: {{ data.this_year.tasks_created }}</p>
                        <p>Tracked hours: {{ format_time(data.this_year.tracked_hours) }}</p>
                    </section>

                    <section>
                        <h3>Last Year</h3>
                        <p>Number of Tasks created: {{ data.last_year.tasks_created }}</p>
                        <p>Tracked hours: {{ format_time(data.last_year.tracked_hours) }}</p>
                    </section>

                </main>
            </div>
        </section>

        <h3 class="stats">Statistics per Category:</h3>
        <nav class="statistics">
            <RouterLink to="/statistics">Overall</RouterLink>
            <RouterLink to="/statistics/WEEK/">This Week</RouterLink>
            <RouterLink to="/statistics/WEEK/-1">Last Week</RouterLink>
            <RouterLink to="/statistics/MONTH">This Month</RouterLink>
            <RouterLink to="/statistics/MONTH/-1">Last Month</RouterLink>
        </nav>

        <section class="statistics">
            <div class="wide">
                <header style='--color: #111'>Statistics</header>
                <main>
                    <section>
                        <h3>Overall {{ data.timeframe.overall.percent }}</h3>
                        <p>Number of Tasks created: {{ data.timeframe.overall.tasks_created }}</p>
                        <p>Tracked hours: {{ format_time(data.timeframe.overall.tracked_hours) }}</p>
                    </section>

                    <section>
                        <h3>Sleep this week</h3>
                        <p>Number of tracked sessions: {{ data.timeframe.sleep.sessions }}</p>
                        <p>Time slept: {{ format_time(data.timeframe.sleep.hours) }}</p>
                    </section>

                    <section>
                        <h3>Timeframe stats</h3>
                        <p>Hours in timeframe: {{ hours_in_timeframe }}</p>
                        <p></p>
                    </section>
                </main>
                <progress :value="data.timeframe.overall.tracked_hours / hours_in_timeframe"></progress>
            </div>
        </section>

        <section class="statistics week_stats">
            <div class="panel" v-for="category in data.timeframe.categories">
                <header>
                    <div class='categoryIndicator' :style="{ '--color': `#${category.color}` }"></div>{{ category.name
                    }}
                </header>
                <div class="category">
                    <!-- <?php $data = getStats($category['ID'], $get_timeframe, $get_offset); ?> -->
                    <p>Number of Tasks created: {{ category.tasks_created }}</p>
                    <p>
                        Tracked hours: {{ format_time(category.tracked_hours) }}
                        <template v-if="category.share > 0">
                            ({{ (category.share * 100).toFixed(1)
                            }}%)

                        </template>
                    </p>
                </div>
                <progress :value="category.tracked_hours / data.timeframe.overall.tracked_hours"
                    :style="{ '--color': `#${category.color}` }"></progress>

            </div>
        </section>
    </template>
</template>


<style scoped>
section.week_stats {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1em;
}

h3.stats {
    padding: 0.5em 1em;
    margin-top: 2em;
    font-size: 1.3em;
}

.statistics {
    margin: 1em;
}

.statistics .wide {
    width: 100%;
}

.statistics progress {
    box-sizing: border-box;
    -webkit-appearance: none;
    appearance: none;
    border: none;

    block-size: auto;
    inline-size: auto;
    vertical-align: 8px;

    width: 100%;
    height: 0.5em;
    border-radius: 0 0 0.5em 0.5em;
    overflow: hidden;
}

/* Chrome, Safari, Edge */
progress::-webkit-progress-bar {
    background-color: #333;
    /* border-radius: 999px; */
}

progress::-webkit-progress-value {
    background-color: var(--color, darkgreen);
    /* border-radius: 999px; */
}

/* Firefox */
progress::-moz-progress-bar {
    background-color: var(--color, darkgreen);
    /* border-radius: 999px; */
}

.statistics .panel {}

.statistics header {
    font-size: 1.2em;
    border-radius: 0.5em 0.5em 0 0;
    padding: 0.25em 0.5em;
    font-weight: 700;
    background-color: #111;
    text-shadow: 0 0 2px black;
    display: flex;
    gap: 0.25em;
}

.statistics main {
    overflow: hidden;
    background-color: #555;
    padding: 0.25em 0.5em;
    /* border-radius: 0 0 0.5em 0.5em; */
    display: flex;
    flex-direction: row;
}

.statistics main section {
    flex-grow: 1;
}

.statistics main section h3 {
    padding: 0.25em 0.5em;
    text-decoration: underline;
}

.statistics .category {
    overflow: hidden;
    background-color: #555;
    padding: 0.25em 0.5em;
    /* border-radius: 0 0 0.5em 0.5em; */
    /* box-sizing: border-box; */
}


.statistics p {
    display: block;
    padding: 0.25em 0.5em;
}

nav.statistics a {
    background-color: #555;
    padding: 0.25em 0.5em;
    margin-left: 0.5em;
}

nav.statistics a:active {
    background-color: #777;
    padding: 0.25em 0.5em;
    margin-left: 0.5em;
}
</style>