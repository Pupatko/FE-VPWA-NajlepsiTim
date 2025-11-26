import { boot } from 'quasar/wrappers'
import { TransmitClient } from '@adonisjs/transmit-client'

export default boot(({ app }) => {
  const socket = new TransmitClient({
    url: 'http://localhost:3333',  // backend
    auth: {
      type: 'bearer',
      token: () => localStorage.getItem('token')
    }
  })

  socket.connect()

  // example listeners
  socket.on('message:new', (data) => {
    console.log('New message:', data)
  })

  app.config.globalProperties.$socket = socket
})

export { }
