import { createRouter, createWebHistory } from 'vue-router'
import HabbitTracker from '@/pages/HabbitTracker.vue'
import Statistics from '@/pages/Statistics.vue'
import Timetable from '@/pages/Timetable.vue'
import Category from '@/pages/Category.vue'
import Tasks from '@/pages/Tasks.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/habits',
      component: HabbitTracker,
    },
    {
      path: '/statistics/:timeframe?/:offset?',
      component: Statistics,
    },
    {
      path: '/timetable',
      component: Timetable,
    },
    {
      path: '/category/:id/:prefix?',
      name: "category",
      component: Category
    },
    {
      path: '/tasks/:date?',
      name: "tasks",
      component: Tasks
    }
  ],
})

export default router
