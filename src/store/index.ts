import { createStore } from 'vuex'
import auth from './modules/auth'
import channelsModule from './modules/channels'

export const store = createStore({
  modules: {
    auth,
    channels: channelsModule,
  },
})

export type RootState = ReturnType<typeof store.state>
export default store
