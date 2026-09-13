import { createRouter, createWebHistory } from 'vue-router'
import HabbitTracker from '@/pages/HabbitTracker.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/habits',
      component: HabbitTracker,
    },
  ],
})

export default router
