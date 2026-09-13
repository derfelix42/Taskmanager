import { createRouter, createWebHistory } from 'vue-router'
import HabbitTracker from '@/pages/HabbitTracker.vue'
import Statistics from '@/pages/Statistics.vue'

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
  ],
})

export default router
