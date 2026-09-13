<script setup lang="ts">
import { getCategoryColors } from '@/api/api';
import { computed } from 'vue';

import { useRoute } from 'vue-router'

const route = useRoute()
const timeframe = computed(() => String(route.params.timeframe))
const offset = computed(() => String(route.params.offset))
// const timeframe: any;
// const offset: any;

function getStats() { // needs to be async obviously
    // make API call
    // function getStats($category="", $timeframe=NULL, $offset=NULL) {
    //     global $db;
    //     $where = "";
    //     $cat_sel = "";
    //     $time_sel_ids = "";
    //     $time_sel_time_tracked = "";

    //     if($timeframe != NULL) {
    //         $week_day = "";
    //         if($timeframe == "WEEK") {
    //             $week_day = ",7";
    //         }
    //         $time_sel_time_tracked = "$timeframe(due$week_day) = $timeframe(CURRENT_DATE$week_day)$offset";
    //         if($timeframe == "WEEK" || $timeframe == "MONTH") {
    //             // TODO: New Year Overwrap makes things go kaboom!
    //             $time_sel_time_tracked .= " AND YEAR(due) = YEAR(CURRENT_DATE)";
    //         }
    //     }

    //     if($category != "") {
    //         $cat_sel = "category = '$category'";
    //     }
    //     // $time_sel_ids = "";

    //     if($cat_sel != "" && $time_sel_ids == "") {
    //         $where = "WHERE $cat_sel";
    //     }
    //     if($time_sel_time_tracked != "" && $where != "") {
    //         $where .= " AND ".$time_sel_time_tracked;
    //     }
    //     if($time_sel_time_tracked != "" && $where == "") {
    //         $where = "WHERE ".$time_sel_time_tracked;
    //     }
    //     $sql = "SELECT COUNT(ID) AS num_ids FROM `tasks` $where";
    //     // echo $sql;
    //     $res = mysqli_query($db, $sql);
    //     $max_id = mysqli_fetch_array($res)["num_ids"];
        
    //     $sql = "SELECT SUM(TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, CURRENT_TIMESTAMP))) as overall_time FROM `task_history` JOIN tasks ON tasks.ID = task_history.taskID $where;";
    //     $res = mysqli_query($db, $sql);
    //     $overall_time = mysqli_fetch_array($res)["overall_time"];
        
    //     $sql = "SELECT SEC_TO_TIME(SUM(TIMESTAMPDIFF(second, start_time, stop_time))) as time_slept FROM `sleep_history` WHERE (WEEK(start_time,7) = WEEK(CURRENT_DATE,7) OR WEEK(stop_time,7) = WEEK(CURRENT_DATE,7)) AND (YEAR(start_time) = YEAR(CURRENT_DATE) OR YEAR(stop_time) = YEAR(CURRENT_DATE));";
    //     $res = mysqli_query($db, $sql);
    //     $time_slept = mysqli_fetch_array($res)["time_slept"];

    //     $seconds = str_pad($overall_time % 60, 2, "0", STR_PAD_LEFT);
    //     $minutes = str_pad(floor($overall_time / 60) % 60, 2, "0", STR_PAD_LEFT);
    //     $hours = str_pad(floor($overall_time / 60 / 60), 2, "0", STR_PAD_LEFT);
    //     $time_string = "-";
    //     if($seconds > 0) {
    //         $time_string = "$seconds seconds";
    //     }
    //     if($minutes > 0) {
    //         $time_string = "$minutes minutes, $time_string";
    //     }
    //     if($hours > 0) {
    //         $time_string = "$hours hours, $time_string";
    //     }

    //     // $days = floor($overall_time / 60 / 60 / 24);
    //     return [$max_id, $time_string, $overall_time, $time_slept];
    // }
    return {
        overall: {
            tasks_created: 100,
            tracked_hours: 200,
        },
        this_year: {
            tasks_created: 100,
            tracked_hours: 200,
        },
        last_year: {
            tasks_created: 100,
            tracked_hours: 200,
        },
        timeframe: {
            overall: {
                tasks_created: 100,
                tracked_hours: 100,
            },
            sleep: {
                sessions: 5,
                hours: 10,
            },
            categories: [
                {
                    color: "",
                    name: "Test",
                    tasks_created: 10,
                    tracked_hours: 100,
                    share: 0.354887,
                }
            ]

        }
    }
}

let data = getStats()

</script>

<template>
<h2>Statistics</h2>
{{ timeframe }} / {{ offset }}
    <section class="statistics">
    <div class="wide">
        <header style='--color: #111'>Instance Statistics</header>
        <main>
            <section>
                <h3>Overall</h3>
                <p>Number of Tasks created: {{ data.overall.tasks_created }}</p>
                <p>Tracked hours: {{ data.overall.tracked_hours }}</p>
            </section>

            <section>
                <h3>This Year</h3>
                <p>Number of Tasks created: {{ data.this_year.tasks_created }}</p>
                <p>Tracked hours: {{ data.this_year.tracked_hours }}</p>
            </section>

            <section>
                <h3>Last Year</h3>
                <p>Number of Tasks created: {{ data.last_year.tasks_created }}</p>
                <p>Tracked hours: {{ data.last_year.tracked_hours }}</p>
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
                <h3>Overall</h3>
                <p>Number of Tasks created: {{ data.timeframe.overall.tasks_created }}</p>
                <p>Tracked hours: {{ data.timeframe.overall.tracked_hours }}</p>
            </section>

            <section>
                <h3>Sleep this week</h3>
                <p>Number of tracked sessions: {{ data.timeframe.sleep.sessions }}</p>
                <p>Time slept: {{ data.timeframe.sleep.hours }}</p>
            </section>

            <section>
                <h3>Timeframe stats</h3>
                <p>Hours in week: {{ 24*7}}h</p>
                <p></p>
            </section>

        </main>
    </div>
</section>

<section class="statistics week_stats">
    <div class="panel" v-for="category in data.timeframe.categories">
        <header><div class='categoryIndicator' style='--color: #777'></div>{{ category.name }}</header>
        <div class="category">
            <!-- <?php $data = getStats($category['ID'], $get_timeframe, $get_offset); ?> -->
            <p>Number of Tasks created:  {{ category.tasks_created }}</p>
            <p>
                Tracked hours:{{ category.tracked_hours }} ({{ category.share * 100 }}%)
            </p>
        </div>
    </div>
</section>

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

.statistics .panel {
}

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
    border-radius: 0 0 0.5em 0.5em;
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
    border-radius: 0 0 0.5em 0.5em;
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