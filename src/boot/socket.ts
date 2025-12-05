import { boot } from 'quasar/wrappers'
import { io, Socket } from 'socket.io-client'
import store from 'src/store'

let socket: Socket | null = null

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $socket: Socket | null
  }
}

function attachListeners(s: Socket) {
  s.on('connect', () => {
    console.log('Socket connected:', s.id, 'userId:', s.auth?.userId)
  })

  s.on('disconnect', () => {
    console.warn('Socket disconnected')
  })

  s.on('connect_error', (error) => {
    console.error('Socket connection error:', error)
  })

  s.on('system', (payload) => {
    console.log('System event received:', payload)

    const currentUserId = store.state.auth?.user?.id

    switch (payload.type) {
      case 'channel_created':
        store.dispatch('channels/handleChannelCreated', {
          id: payload.channelId,
          name: payload.name,
          private: payload.private,
          isOwner: true,
        })
        break

      case 'channel_joined':
        if (!payload.userId || payload.userId === currentUserId) {
          store.dispatch('channels/handleChannelCreated', {
            id: payload.channelId,
            name: payload.name,
            private: payload.private,
            isOwner: false,
          })
        }
        break

      case 'user_left_channel':
        store.dispatch('channels/handleChannelRemoved', payload.channelId)
        break

      case 'channel_deleted':
        store.dispatch('channels/handleChannelRemoved', payload.channelId)
        break

      case 'channel_closed':
        store.dispatch('channels/handleChannelClosed', payload)
        break

      case 'channel_updated':
        store.dispatch('channels/handleChannelUpdated', payload)
        break

      case 'channel_removed':
        store.dispatch('channels/handleChannelRemoved', payload.channelId)
        break

      case 'channel_invited':
        store.dispatch('channels/handleChannelInvited', payload)
        break

      case 'channel_user_left':
        store.dispatch('channels/handleChannelLeft', payload)
        break

      case 'message':
      case 'message_new':
        store.dispatch('channels/handleMessageNew', payload)
        break

      default:
        console.log('Unknown system event type:', payload.type, payload)
    }
  })

  // DEBUG: Log all socket events
  s.onAny((eventName, ...args) => {
    console.log('Socket event:', eventName, args)
  })
}

function connect(app: any, userId: number) {
  console.log('[socket] connecting with userId:', userId)
  if (socket) return socket

  socket = io('http://localhost:3333', {
    transports: ['websocket'],
    auth: { userId },
  })

  attachListeners(socket)

  app.config.globalProperties.$socket = socket
  ;(window as any).$socket = socket

  console.log('Socket.IO initializing...', `for user ${userId}`)

  return socket
}

export default boot(async ({ app }) => {
  // Prefer already-loaded user
  let userId = store.state.auth?.user?.id
  console.log('[socket] boot start, initial userId in store:', userId)

  // If not loaded, try to populate auth from API/token
  if (!userId) {
    try {
      const ok = await store.dispatch('auth/check')
      if (ok) {
        userId = store.state.auth?.user?.id
      }
      console.log('[socket] auth/check result:', ok, 'resolved userId:', userId)
    } catch (err) {
      console.warn('Socket auth check failed, will not connect yet:', err)
    }
  }

  if (userId) {
    connect(app, userId)
  } else {
    console.warn('Socket not initialized: missing userId (login required)')
    app.config.globalProperties.$socket = null
    ;(window as any).$socket = null

    // Watch for future login and connect once
    store.watch(
      (state) => state.auth?.user?.id,
      (newId) => {
        if (newId) {
          console.log('[socket] store watch detected userId, connecting now:', newId)
          connect(app, newId)
        }
      },
      { immediate: false }
    )
  }
})
