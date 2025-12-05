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
  shouldNotify(options) {
    const { message, currentUserId, appVisible, userStatus, notifyMentionsOnly } = options
    const settings = this.loadSettings()
    const preferMentions = notifyMentionsOnly ?? settings.type === 'mentions'

    if (appVisible) return false
    if (userStatus === 'offline' || userStatus === 'dnd') return false

    const senderId = Number(message.userId || message.user_id)
    if (senderId && senderId === currentUserId) return false

    if (preferMentions) {
      const mentioned = Number(message.mentionedUserId ?? message.mentioned_user_id)
      const isMentioned = mentioned === currentUserId
      const isDirect = message.channelType === 'dm' || message.isDirect === true
      if (!isMentioned && !isDirect) return false
    }

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return 'Notification' in window && Notification.permission === 'granted'
  }

  // show notification for new message
  notifyNewMessage(options) {
    const {
      message,
      channelName,
      senderName,
      currentUserId,
      userStatus,
      notifyMentionsOnly,
      appVisible,
    } = options

    if (
      !this.shouldNotify({
        message,
        currentUserId,
        appVisible,
        userStatus,
        notifyMentionsOnly,
      })
    ) {
      return
    }

    const settings = this.loadSettings()
    const title = senderName || `New message${channelName ? ` in #${channelName}` : ''}`
    const body =
      settings.showPreview !== false && message?.content
        ? `${senderName || ''} ${message.content}`.trim().slice(0, 120)
        : 'You have a new message'

    const notification = new Notification(title, {
      body,
      icon: '/icons/icon-128x128.png',
      tag: `message-${channelName || message?.channelId || 'general'}`,
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }
}

// singleton instance
export const messageNotifications = new MessageNotificationService()
