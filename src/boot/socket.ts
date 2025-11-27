import { boot } from 'quasar/wrappers'
import { io, Socket } from 'socket.io-client'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $socket: Socket
  }
}

export default boot(({ app }) => {
  const socket = io('http://localhost:3333', {
    transports: ['websocket'],
  })

  app.config.globalProperties.$socket = socket
})

export {}
