// src/router/index.ts
// ─── MVI: Router Configuration ───────────────────────────────────────────────
// The router performs route guards by reading the store model (read-only).
// Guards do NOT dispatch intents — they are passive observers of state.
// ─────────────────────────────────────────────────────────────────────────────

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useResultsStore } from '@/stores/results'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/upload',
      name: 'upload',
      component: () => import('../views/UploadView.vue'),
      beforeEnter: (_to, _from, next) => {
        // Guard: redirect to results if session already exists (passive read from sessionStorage)
        const sessionId = sessionStorage.getItem('chat_analisis_session_id')
        if (sessionId) {
          next('/results')
        } else {
          next()
        }
      },
    },
    {
      path: '/results',
      name: 'results',
      component: () => import('../views/ResultsView.vue'),
      beforeEnter: (_to, _from, next) => {
        // Guard: read model state without dispatching any intent
        const store = useResultsStore()
        if (store.isAnalyzed) {
          next()
        } else {
          next('/upload')
        }
      },
    },
    {
      path: '/results/topics/:topicId',
      name: 'topic-detail',
      component: () => import('../views/TopicDetailView.vue'),
      beforeEnter: (_to, _from, next) => {
        // Guard: read model state without dispatching any intent
        const store = useResultsStore()
        if (store.isAnalyzed) {
          next()
        } else {
          next('/upload')
        }
      },
    },
    {
      path: '/result',
      redirect: '/results',
    },
  ],
})

export default router
