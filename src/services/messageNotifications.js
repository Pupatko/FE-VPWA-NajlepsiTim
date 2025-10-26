// src/services/messageNotifications.js

export class MessageNotificationService {
  constructor() {
    this.notifications = null
    this.initialized = false
  }
  
  // initialize service with quasar instance
  init($q) {
    if (this.initialized) return
    
    // store quasar instance
    this.$q = $q
    
    // request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    
    this.initialized = true
  }
  
  // load user settings from localStorage
  loadSettings() {
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
  
  // check if user should receive notification
  shouldNotify(message, currentUser) {
    const settings = this.loadSettings()
    
    // if notifications are disabled
    if (settings.type === 'disabled') return false
    
    // don't notify for own messages
    if (message.author === currentUser) return false
    
    switch (settings.type) {
      case 'all':
        return true
        
      case 'mentions':
        // check if message contains mention
        return message.content.includes(`@${currentUser}`)
        
      default:
        return false
    }
  }
  
  // show notification for new message
  notifyNewMessage(message, channelName, currentUser) {
    if (!this.shouldNotify(message, currentUser)) {
      return
    }
    
    const settings = this.loadSettings()
    
    const title = `New message in #${channelName}`
    const body = settings.showPreview !== false
      ? `${message.author}: ${message.content}`
      : 'You have a new message'
    
    // check if app is visible using quasar instance
    if (this.$q && this.$q.appVisible) {
      // use quasar notify
      this.$q.notify({
        message: title,
        caption: body,
        icon: 'notifications',
        color: 'primary',
        position: 'top-right',
        timeout: 3000,
        actions: [
          { label: 'Dismiss', color: 'white' }
        ]
      })
    } else {
      // use browser notification
      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: '/icons/icon-128x128.png',
          tag: `message-${channelName}`
        })
        
        notification.onclick = () => {
          window.focus()
          notification.close()
        }
      }
    }
  }
}

// singleton instance
export const messageNotifications = new MessageNotificationService()
