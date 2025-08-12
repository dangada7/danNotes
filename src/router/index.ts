import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import NotesPage from '../components/NotesPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/notes'
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginPage,
      meta: { requiresAuth: false }
    },
    {
      path: '/notes',
      name: 'Notes',
      component: NotesPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/note/:id',
      name: 'NoteEdit',
      component: NotesPage, // For now, redirect back to notes page
      meta: { requiresAuth: true },
      beforeEnter: (to) => {
        // For now, redirect to notes page since we don't have an edit component yet
        return { path: '/notes' }
      }
    }
  ],
})

export default router
