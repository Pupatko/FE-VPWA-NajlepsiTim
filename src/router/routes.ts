import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // authentication routes
  {
    path: '/register',
    component: () => import('layouts/JustPageLayout.vue'),
    children: [
      { path: '', component: () => import('pages/RegisterPage.vue') }
    ],
  },
  {
    path: '/login',
    component: () => import('layouts/JustPageLayout.vue'),
    children: [
      { path: '', component: () => import('pages/LoginPage.vue') }
    ],
  },

  // main app routes with sidebar
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'channel', component: () => import('pages/ChatPage.vue') },
      { path: 'create-channel', component: () => import('pages/CreateChannelPage.vue') },
      { path: 'settings', component: () => import('pages/SettingsPage.vue') },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') },
      { path: 'public-channels', component: () => import('pages/ViewPublicChannelsPage.vue') }
    ],
  },

  // error page
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
