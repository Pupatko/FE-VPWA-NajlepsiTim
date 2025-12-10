import { ref } from 'vue'
import { Notify } from 'quasar'
import type { PresenceStatus } from 'src/store/modules/presence'

type RawMessage = {
  id?: number
  content?: string
  userId?: number
  user_id?: number
  channelId?: number
  channel_id?: number
  mentionedUserId?: number | null
  mentioned_user_id?: number | null
}

export type NotificationMode = 'all' | 'mentions_only'

export interface NotifyMessageOptions {
  message: RawMessage
  channelName?: string
  senderName?: string
  currentUserId: number
  currentUserNick?: string
  userStatus: PresenceStatus
  notifyMentionsOnly?: boolean
  appVisible?: boolean
}

const permissionState = ref<NotificationPermission>(
  typeof window !== 'undefined' && 'Notification' in window
    ? Notification.permission
    : 'denied'
)

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const isDocumentVisible = (fallbackVisible?: boolean) => {
  if (typeof document === 'undefined') return fallbackVisible === true
  return document.visibilityState === 'visible'
}

const isMentioned = (message: RawMessage, currentUserId: number, currentNick?: string) => {
  const mentionedId = Number(message.mentionedUserId ?? message.mentioned_user_id)
  if (mentionedId && mentionedId === currentUserId) return true

  if (!currentNick || !message.content) return false
  const pattern = new RegExp(`@${escapeRegExp(currentNick)}\\b`, 'i')
  return pattern.test(message.content)
}

const shortPreview = (text: string | undefined, max = 120) => {
  const normalized = (text || '').trim()
  if (!normalized) return 'New message'
  return normalized.length > max ? `${normalized.slice(0, max)}...` : normalized
}

const ensurePermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (permissionState.value === 'granted') return true
  if (permissionState.value === 'denied') return false

  permissionState.value = await Notification.requestPermission()
  return permissionState.value === 'granted'
}

const shouldNotify = (options: NotifyMessageOptions) => {
  const { message, currentUserId, notifyMentionsOnly, userStatus, appVisible, currentUserNick } =
    options

  if (userStatus !== 'online') {
    console.debug('[notify] skip: userStatus', userStatus)
    return false
  }

  const visible = isDocumentVisible(appVisible)
  if (visible) {
    console.debug('[notify] skip: document visible')
    return false
  }

  const senderId = Number(message.userId ?? message.user_id)
  if (senderId && senderId === currentUserId) {
    console.debug('[notify] skip: self message')
    return false
  }

  if (notifyMentionsOnly && !isMentioned(message, currentUserId, currentUserNick)) {
    console.debug('[notify] skip: mentions only, no mention match')
    return false
  }

  return true
}

const showNativeNotification = (title: string, body: string, tag: string) => {
  const notification = new Notification(title, {
    body,
    icon: '/icons/icon-128x128.png',
    tag,
  })

  notification.onclick = () => {
    window.focus()
    notification.close()
  }
}

const showFallbackNotification = (title: string, body: string) => {
  Notify.create({
    color: 'primary',
    message: title,
    caption: body,
    position: 'top-right',
    icon: 'chat',
    timeout: 5000,
  })
}

export const useMessageNotifications = () => {
  const notifyOnMessage = async (options: NotifyMessageOptions) => {
    if (!shouldNotify(options)) return

    const title =
      options.senderName || `New message${options.channelName ? ` in #${options.channelName}` : ''}`
    const body = shortPreview(options.message.content)
    const tag = `message-${options.channelName || options.message.channelId || 'general'}`

    if (await ensurePermission()) {
      console.debug('[notify] showing native', { title, tag })
      showNativeNotification(title, body, tag)
      return
    }

    console.debug('[notify] fallback notify (permission not granted)', { title, tag })
    showFallbackNotification(title, body)
  }

  return {
    ensurePermission,
    notifyOnMessage,
  }
}

export const messageNotifications = useMessageNotifications()
