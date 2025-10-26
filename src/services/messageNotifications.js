import { useNotifications } from '../composables/useNotifications'

export class MessageNotificationService {
  constructor() {
    this.notifications = useNotifications()
    this.initialized = false
  }
  
  // initialize service once on app start
  async init() {
    if (this.initialized) return
    
    // automatically request permission
    await this.notifications.checkAndRequestPermission()
    this.initialized = true
  }
  
  // load user settings from localStorage
  loadSettings() {
    return this.notifications.getNotificationSettings()
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
    
    this.notifications.showNotification(title, {
      body,
      icon: '/icons/icon-128x128.png',
      tag: `message-${channelName}`,
      onClick: () => {
        console.log('notification clicked for channel:', channelName)
      }
    })
  }
}

// singleton instance
export const messageNotifications = new MessageNotificationService()
