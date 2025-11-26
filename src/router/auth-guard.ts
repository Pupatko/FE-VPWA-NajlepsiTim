import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import authManager from 'src/services/auth-manager'

export function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const token = authManager.getToken()
  const publicPages = ['/login', '/register']
  const authRequired = !publicPages.includes(to.path)

  // Redirect to login if not authenticated and route requires auth
  if (authRequired && !token) {
    return next({ 
      path: '/login', 
      query: { redirect: to.fullPath } 
    })
  }

  // Redirect to channels if authenticated and trying to access public pages
  if (publicPages.includes(to.path) && token) {
    return next('/channels')
  }

  next()
}
