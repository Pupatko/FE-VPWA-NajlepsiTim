import { useQuasar } from 'quasar'
import { ref } from 'vue'

export function useNotifications() {
  const $q = useQuasar()
  const notificationPermission = ref(Notification.permission)
  
  // request browser notification permission
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('browser does not support notifications')
      return false
    }
    
    if (notificationPermission.value === 'granted') {
      return true
    }
    
    const permission = await Notification.requestPermission()
    notificationPermission.value = permission
    return permission === 'granted'
  }
  
  // check and request permission automatically on first load
  const checkAndRequestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      return await requestPermission()
    }
    return Notification.permission === 'granted'
  }
  
  // main function to show notification based on app visibility
  const showNotification = (title, options = {}) => {
    // load user settings from localStorage
    const settings = getNotificationSettings()
    
    // if app is visible, use quasar notify
    if ($q.appVisible) {
      $q.notify({
        message: title,
        caption: options.body,
        icon: 'notifications',
        color: 'primary',
        position: 'top-right',
        timeout: 3000,
        actions: [
          { label: 'Dismiss', color: 'white' }
        ]
      })
    } else {
      // if app is hidden, use browser notification
      if (notificationPermission.value === 'granted') {
        const notification = new Notification(title, {
          body: options.body,
          icon: options.icon || '/icons/icon-128x128.png',
          badge: '/icons/icon-128x128.png',
          tag: options.tag || 'default',
          ...options
        })
        
        // clicking notification brings window to focus
        notification.onclick = () => {
          window.focus()
          notification.close()
          if (options.onClick) options.onClick()
        }
      }
    }
  }
  
  // get notification settings from localStorage
  const getNotificationSettings = () => {
    const saved = localStorage.getItem('notificationSettings')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        return { type: 'all', showPreview: true }
      }
    }
    return { type: 'all', showPreview: true }
  }
  
  return {
    notificationPermission,
    requestPermission,
    checkAndRequestPermission,
    showNotification,
    getNotificationSettings
  }
}
