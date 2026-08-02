import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';

const isGitHubPagesBuild = import.meta.env.BASE_URL !== '/';

export const router = createRouter({
  history: isGitHubPagesBuild
    ? createWebHashHistory(import.meta.env.BASE_URL)
    : createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/resumes',
      name: 'resumes',
      component: () => import('../views/ResumeListView.vue'),
    },
    {
      path: '/editor',
      redirect: '/resumes',
    },
    {
      path: '/editor/:resumeId',
      name: 'editor',
      component: () => import('../views/EditorView.vue'),
    },
  ],
});
