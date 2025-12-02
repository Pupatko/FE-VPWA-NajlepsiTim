import { boot } from 'quasar/wrappers'
import { io, Socket } from 'socket.io-client'
import store from 'src/store' 

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $socket: Socket
  }
}

export default boot(({ app }) => {
  // ✅ KROK 1: Získaj userId zo store
  const userId = store.state.auth?.user?.id

  // ✅ KROK 2: Pripoj socket S userId v auth
  const socket = io('http://localhost:3333', {
    transports: ['websocket'],
    auth: {
      userId: userId, // 🔑 Toto je kľúčové!
    },
  })

  console.log('🔌 Socket.IO initializing...', userId ? `for user ${userId}` : '⚠️ without auth')

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id, 'userId:', userId)
  })

  socket.on('disconnect', () => {
    console.warn('❌ Socket disconnected')
  })

  socket.on('connect_error', (error) => {
    console.error('🔴 Socket connection error:', error)
  })

  //
  //  REGISTER SOCKET EVENT HANDLERS
  //

  socket.on('system', (payload) => {
    console.log('📨 System event received:', payload)
    
    const currentUserId = store.state.auth?.user?.id

    switch (payload.type) {
      case 'channel_created':
        console.log('🆕 Channel created:', payload)
        store.dispatch('channels/handleChannelCreated', {
          id: payload.channelId,
          name: payload.name,
          private: payload.private,
          isOwner: true,
        })
        break

      case 'channel_joined':
        console.log('✅ Channel joined:', payload)
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
        console.log('👋 User left channel:', payload)
        // ✅ S user rooms: Dostaneš event IBA ak si to TY
        // Takže netreba kontrolovať userId
        console.log('🚪 You left the channel, removing from list')
        store.dispatch('channels/handleChannelRemoved', payload.channelId)
        break

      case 'channel_deleted':
        console.log('🗑️ Channel deleted:', payload)
        store.dispatch('channels/handleChannelRemoved', payload.channelId)
        
        if (payload.reason === 'owner_canceled') {
          console.log(`⚠️ Channel "${payload.channelName}" was deleted because owner canceled`)
        } else if (payload.reason === 'owner_quit') {
          console.log(`⚠️ Channel "${payload.channelName}" was deleted by owner`)
        }
        break

      case 'channel_closed':
        console.log('🚪 Channel closed:', payload)
        store.dispatch('channels/handleChannelClosed', payload)
        break

      case 'user_left':
        console.log('👤 User left (notification):', payload)
        // Niekto iný opustil kanál
        break

      case 'join':
        console.log('👤 User joined channel:', payload)
        break

      case 'channel_updated':
        console.log('✏️ Channel updated:', payload)
        store.dispatch('channels/handleChannelUpdated', payload)
        break

      case 'channel_removed':
        console.log('🗑️ Channel removed:', payload)
        store.dispatch('channels/handleChannelRemoved', payload.channelId)
        break

      case 'channel_invited':
        console.log('📨 Channel invitation:', payload)
        store.dispatch('channels/handleChannelInvited', payload)
        break

      case 'channel_user_left':
        console.log('👋 User left channel (legacy):', payload)
        store.dispatch('channels/handleChannelLeft', payload)
        break

      case 'message':
      case 'message_new':
        console.log('💬 New message:', payload)
        store.dispatch('channels/handleMessageNew', payload)
        break

      default:
        console.log('⚠️ Unknown system event type:', payload.type, payload)
    }
  })

  // DEBUG: Log all socket events
  socket.onAny((eventName, ...args) => {
    console.log('🎯 Socket event:', eventName, args)
  })

  // Expose socket globally
  app.config.globalProperties.$socket = socket
  ;(window as any).$socket = socket
  
  console.log('✅ Socket boot completed')
})