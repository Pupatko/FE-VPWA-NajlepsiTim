import { boot } from 'quasar/wrappers'
import { io, Socket } from 'socket.io-client'
import { Notify, AppVisibility } from 'quasar'
import { api } from 'src/boot/axios'
import store from 'src/store'
import type { PresenceStatus } from 'src/store/modules/presence'

let socket: Socket | null = null
let socketUserId: number | null = null
const SYNC_EVENT = 'chat:sync'
let lastPresenceStatus: PresenceStatus | null = store.state.presence?.selfStatus ?? null

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $socket: Socket | null
  }
}

const statusFromStateNumber = (state?: number | null): PresenceStatus => {
  if (state === 2) return 'dnd'
  if (state === 3) return 'offline'
  return 'online'
}

const preferredStatus = (): PresenceStatus => {
  const self = store.state.presence?.selfStatus
  if (self) return self
  const stateNumber = store.state.auth?.user?.state
  return statusFromStateNumber(stateNumber)
}

const markSelfStatus = (status: PresenceStatus) => {
  const uid = store.state.auth?.user?.id
  if (uid) {
    store.dispatch('presence/setStatus', { userId: uid, status })
  }
  store.dispatch('presence/setSelfStatus', status)
}

const dispatchSyncEvent = (payload: any) => {
  try {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: payload }))
  } catch (err) {
    console.warn('Failed to dispatch sync event', err)
  }
}

const runSync = async () => {
  const since = store.state.presence?.lastSyncAt
  if (!since) {
    store.dispatch('presence/setLastSyncAt', new Date().toISOString())
    return
  }

  try {
    const { data } = await api.get('/sync', { params: { since } })
    dispatchSyncEvent(data)
    store.dispatch('presence/setLastSyncAt', new Date().toISOString())
  } catch (err) {
    console.warn('Sync failed', err)
  }
}

function setSocketRefs(app: any, value: Socket | null) {
  app.config.globalProperties.$socket = value
  ;(window as any).$socket = value
}

function disconnectSocket(app: any) {
  try {
    socket?.disconnect()
  } catch (err) {
    console.warn('Socket disconnect failed', err)
  }
  socket = null
  socketUserId = null
  setSocketRefs(app, null)
}

function attachListeners(s: Socket) {
  s.on('connect', async () => {
    console.log('Socket connected:', s.id, 'userId:', s.auth?.userId)
    const handshakeUserId = Number((s.auth as any)?.userId)
    if (!Number.isNaN(handshakeUserId)) {
      socketUserId = handshakeUserId
    }
    const desiredStatus = preferredStatus()

    markSelfStatus(desiredStatus)
    s.emit('status:update', { status: desiredStatus })

    await runSync()
  })

  s.on('disconnect', () => {
    console.warn('Socket disconnected')
    socketUserId = null
    markSelfStatus('offline')
    store.dispatch('presence/setLastSyncAt', new Date().toISOString())
  })

  s.on('connect_error', (error) => {
    console.error('Socket connection error:', error)
  })

  s.on('user_status_changed', (payload) => {
    if (payload?.userId && payload?.status) {
      store.dispatch('presence/setStatus', {
        userId: Number(payload.userId),
        status: payload.status,
      })
    }
  })

  s.on('system', (payload) => {
    console.log('System event received:', payload)

    const currentUserId = store.state.auth?.user?.id

    switch (payload.type) {
      case 'channel_created':
        // only the creator is a member/owner; skip for other users to avoid ghost ownership
        if (payload.ownerId && payload.ownerId === currentUserId) {
          store.dispatch('channels/handleChannelCreated', {
            id: payload.channelId,
            name: payload.name,
            private: payload.private,
            isOwner: true,
          })
        }
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

      case 'channel_revoked':
        store.dispatch('channels/handleChannelRemoved', payload.channelId)
        Notify.create({
          type: 'negative',
          message: `You were removed from channel #${payload.name || payload.channelId}`,
          caption: 'channel revoked',
        })
        try {
          window.location.href = '/'
        } catch (e) {
          console.warn('redirect after revoke failed', e)
        }
        break

      case 'channel_kicked':
        store.dispatch('channels/handleChannelRemoved', payload.channelId)
        Notify.create({
          type: 'negative',
          message: `You were kicked from channel #${payload.name || payload.channelId}`,
          caption: 'channel kicked',
        })
        try {
          window.location.href = '/'
        } catch (e) {
          console.warn('redirect after kick failed', e)
        }
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

  s.on('new_message', (payload) => {
    store.dispatch('channels/handleMessageNew', payload)
  })

  // DEBUG: Log all socket events
  s.onAny((eventName, ...args) => {
    console.log('Socket event:', eventName, args)
  })
}

function connect(app: any, userId: number) {
  console.log('[socket] connecting with userId:', userId)
  if (socket && socketUserId && socketUserId !== userId) {
    disconnectSocket(app)
  }

  if (socket && socket.connected) return socket

  if (socket && !socket.connected) {
    socket.auth = { userId }
    socketUserId = userId
    socket.connect()
    setSocketRefs(app, socket)
    return socket
  }

  socket = io('http://localhost:3333', {
    transports: ['websocket'],
    auth: { userId },
  })
  socketUserId = userId

  attachListeners(socket)

  setSocketRefs(app, socket)

  console.log('Socket.IO initializing...', `for user ${userId}`)

  return socket
}

function handleVisibilityChange(visible: boolean) {
  store.dispatch('presence/setAppVisibility', visible)
  if (socket?.connected) {
    socket.emit('client_visibility_changed', { visible })
  }
}

export default boot(async ({ app }) => {
  let userId = store.state.auth?.user?.id
  console.log('[socket] boot start, initial userId in store:', userId)

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

  if (store.state.auth?.user?.state !== undefined) {
    const initStatus = statusFromStateNumber(store.state.auth.user.state)
    const preferred = store.state.presence?.selfStatus
    if (initStatus !== 'offline' || !preferred || preferred === 'offline') {
      store.dispatch('presence/setSelfStatus', initStatus)
    }
  }

  if (userId) {
    const initialStatus = preferredStatus()
    if (initialStatus !== 'offline') {
      connect(app, userId)
    } else {
      app.config.globalProperties.$socket = null
      ;(window as any).$socket = null
    }
  } else {
    console.warn('Socket not initialized: missing userId (login required)')
    app.config.globalProperties.$socket = null
    ;(window as any).$socket = null
    store.dispatch('presence/reset')
  }

  store.watch(
    (state) => state.auth?.user?.id,
    (newId) => {
      if (!newId) {
        console.log('[socket] user logged out, disconnecting socket')
        disconnectSocket(app)
        store.dispatch('presence/reset')
        return
      }

      const status = preferredStatus()
      if (status !== 'offline') {
        console.log('[socket] store watch detected userId, connecting now:', newId)
        connect(app, newId)
      }
    },
    { immediate: false }
  )

  store.watch(
    (state) => state.presence?.selfStatus,
    (newStatus) => {
      const previousStatus = lastPresenceStatus
      lastPresenceStatus = newStatus

      const uid = store.state.auth?.user?.id
      if (!uid) return

      if (newStatus === 'offline') {
        if (socket?.connected) {
          socket.emit('status:update', { status: 'offline' })
        }
        socket?.disconnect()
        return
      }

      const active = connect(app, uid)
      if (active?.connected) {
        active.emit('status:update', { status: newStatus })
        store.dispatch('presence/setStatus', { userId: uid, status: newStatus })
      }

      if (previousStatus === 'offline' && newStatus === 'online') {
        store.dispatch('channels/fetchMyChannels').catch((err: unknown) => {
          console.warn('Failed to refresh channels after reconnect', err)
        })
        void runSync()
      }
    },
    { immediate: false }
  )

  if (AppVisibility && typeof AppVisibility.listen === 'function') {
    AppVisibility.listen((isVisible: boolean) => handleVisibilityChange(isVisible))
  } else if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () =>
      handleVisibilityChange(!document.hidden)
    )
  }
})
