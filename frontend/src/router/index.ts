import { createRouter, createWebHistory } from 'vue-router'
import HabbitTracker from '@/pages/HabbitTracker.vue'
import Statistics from '@/pages/Statistics.vue'
import Timetable from '@/pages/Timetable.vue'
import Category from '@/pages/Category.vue'
import Tasks from '@/pages/Tasks.vue'
import Settings from '@/pages/Settings.vue'
import Trash from '@/pages/Trash.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import Login from '@/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/',
      redirect: '/tasks/today',
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '/habits',
          component: HabbitTracker,
        },
        {
          path: '/statistics/:timeframe?/:offset?',
          component: Statistics,
        },
        {
          path: '/timetable/:date?',
          name: "timetable",
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
        },
        {
          path: '/settings',
          name: "settings",
          component: Settings
        },
        {
          path: '/trash',
          name: "trashcan",
          component: Trash
        },
      ],
    },
  ],
})

export default router
