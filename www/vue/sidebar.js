import { createApp, ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

const sidebar = createApp({
    setup() {
        const categories = ref({})

        onMounted(async () => {
            categories.value = await getCategoryColors()
        })

        return {
            categories
        }
    },
    template: `
  <ul id="categories">
  <a href='?'>
    <li>All Tasks</li>
  </a>
  <hr>
  <template v-for="category in categories" :key="category.ID">
    <a v-if="category.display === '1'" :href="'?category='+category.ID">
        <li>
            <div class="categoryIndicator" :style="'--color: #'+(category.color||'777')"></div>
            {{category.Bezeichnung}}
        </li>
        <template v-for="prefix in category.prefixes?.split(',')" :key="category.ID+'-'+prefix">
            <a v-if="prefix?.indexOf(category.Bezeichnung) === -1" :href="'?category='+category.ID+'&prefix='+prefix">
                <li>
                    <div class="categoryIndicator"></div>
                    > {{prefix}}
                </li>
            </a>
        </template>
    </a>
  </template>
</ul>
<hr>
<!-- <ul>
  <li>Drucksachen</li>
  <a href="#" onclick="printPDF('../plans/DayTodoPlanII.pdf')">
    <li>> Pomodoro DayPlan</li>
  </a>
  <a href="#" onclick="printPDF('../plans/WochenToDo.pdf')">
    <li>> Wochenstatistik</li>
  </a>
  <a href="#" onclick="printPDF('../plans/Wochenplan2.pdf')">
    <li>> Stundenplan</li>
  </a>
  <a href="#" onclick="printPDF('../plans/dayTodoWeekPlan2Printable.pdf')">
    <li>> Tages Todo Faltware</li>
  </a>
</ul>
<hr> -->
<ul>
  <a href="?timetable">
    <li>Timetable</li>
  </a>
  <a href="?habits">
    <li>Habit Tracker</li>
  </a>
  <!-- <a href="?calendar"><li>Calendar</li></a> -->
</ul>
<hr>
<ul>
  <a href="?yesterday">
    <li>Gestern</li>
  </a>
  <a href="?today">
    <li>Heutige Aufgaben</li>
  </a>
  <a href="?tomorrow">
    <li>Morgen</li>
  </a>
</ul>
<hr>
<ul>
<!--a href="?search">
<li>Search <i class="fas fa-search small"></i></li>
</a-->
<!-- <a href="?bahnapi">
<li>BahnAPI</li>
</a> -->
<a href="?settings">
<li>Settings</li>
</a>
<!-- <a href="?youtube">
<li>Youtube History</li>
</a> -->
<a href="/phpmyadmin" target="_blank">
  <li>phpMyAdmin <i class="fas fa-up-right-from-square small"></i></li>
</a>
</ul>  `
})

sidebar.mount("#sidebar")