import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  
  {
    path: '/register',
    component: () => import('layouts/JustPageLayout.vue'),
    children: [{ path: '', component: () => import('pages/RegisterPage.vue') }],
  },

  {
    path: '/login',
    component: () => import('layouts/JustPageLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }],
  },

  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [ { path: 'channel', component: () => import('pages/ChatPage.vue') },
                { path: 'create-channel', component: () => import('pages/CreateChannelPage.vue') }],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
