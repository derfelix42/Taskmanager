<script setup lang="ts">
import { getCategoryColors } from '@/api/api';
import { onMounted, ref } from 'vue'

const categories = ref<any[]>([])

onMounted(async () => {
  categories.value = await getCategoryColors()
})
</script>

<template>
  <div id="sidebar">

  <ul id="categories">
      <RouterLink to="/tasks">
        <li>
          All Tasks
        </li>
      </RouterLink>
    <hr />

    <template v-for="category in categories" :key="category.ID">
        <RouterLink :to="{name: 'category', params: {id: category.ID}}" v-if="category.display">
          <li>
            <span class="categoryIndicator" :style="{ '--color': '#' + (category.color || '777') }"></span>
            {{ category.Bezeichnung }}
          </li>
        </RouterLink>
        <ul v-if="category.prefixes">
          <template v-for="prefix in category.prefixes.split(',')" :key="category.ID + '-' + prefix">
            <RouterLink v-if="prefix && prefix.indexOf(category.Bezeichnung) === -1" :to="{name: 'category', params: {id: category.ID, prefix}}">
              <li>
                <span class="categoryIndicator"></span>
                > {{ prefix }}
              </li>
            </RouterLink>
          </template>
        </ul>
    </template>
  </ul>

  <hr />

  <ul>
    <RouterLink to="/timetable"><li>Timetable</li></RouterLink>
    <RouterLink to="/habits"><li>Habit Tracker</li></RouterLink>
  </ul>

  <hr />

  <ul>
    <RouterLink to="/tasks/yesterday"><li>Gestern</li></RouterLink>
    <RouterLink to="/tasks/today"><li>Heutige Aufgaben</li></RouterLink>
    <RouterLink to="/tasks/tomorrow"><li>Morgen</li></RouterLink>
  </ul>

  <hr />

  <ul>
    <RouterLink to="/statistics"><li>Statistics <i class="fa-solid fa-chart-line"></i></li></RouterLink>
    <RouterLink to="/trash"><li>Trashcan <i class="fa-solid fa-trash-can-line"></i></li></RouterLink>
    <RouterLink to="/settings"><li>Settings <i class="fa-solid fa-gears-line"></i></li></RouterLink>
    <li>
      <a href="/phpmyadmin/index.php?route=/sql&pos=0&db=j_tasks&table=tasks" target="_blank">
        phpMyAdmin <i class="fas fa-up-right-from-square small"></i>
      </a>
    </li>
  </ul>
  </div>
</template>

<style>
#sidebar {
  grid-area: sidebar;
  background-color: #111;
  color: white;
  position: sticky;
}

#sidebar a {
  color: white;
}

#sidebar ul li {
  text-decoration: none;
  list-style-type: none;
  padding: 5px;
  cursor: pointer;
  transition: 0.1s linear;
}

#sidebar ul li:hover {
  background-color: rgba(255, 255, 255, 0.25);
  font-weight: 700;
  text-shadow: 0 0 #fff;
}

@media screen and (max-width: 600px) {
  #sidebar {
    display: none;
  }
}


</style>