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
    <li><a href="?">All Tasks</a></li>
    <hr />

    <template v-for="category in categories" :key="category.ID">
      <li v-if="category.display">
        <a :href="'?category=' + category.ID">
          <span
            class="categoryIndicator"
            :style="{ '--color': '#' + (category.color || '777') }"
          ></span>
          {{ category.Bezeichnung }}
        </a>

        <ul v-if="category.prefixes">
          <li v-for="prefix in category.prefixes.split(',')" :key="category.ID + '-' + prefix">
            <a
              v-if="prefix && prefix.indexOf(category.Bezeichnung) === -1"
              :href="'?category=' + category.ID + '&prefix=' + prefix"
            >
              <span class="categoryIndicator"></span>
              > {{ prefix }}
            </a>
          </li>
        </ul>
      </li>
    </template>
  </ul>

  <hr />

  <ul>
    <li><RouterLink to="/timetable">Timetable</RouterLink></li>
    <li><RouterLink to="/habits">Habit Tracker</RouterLink></li>
  </ul>

  <hr />

  <ul>
    <li><a href="?yesterday">Gestern</a></li>
    <li><a href="?today">Heutige Aufgaben</a></li>
    <li><a href="?tomorrow">Morgen</a></li>
  </ul>

  <hr />

  <ul>
    <li><RouterLink to="/statistics">Statistics <i class="fa-solid fa-chart-line"></i></RouterLink></li>
    <li>
      <a href="?trash">
        Trashcan <i class="fa-solid fa-trash-can small"></i>
      </a>
    </li>
    <li>
      <a href="?settings">
        Settings <i class="fa-solid fa-gears small"></i>
      </a>
    </li>
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