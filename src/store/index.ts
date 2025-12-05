import { createStore } from 'vuex'
import auth from './modules/auth'
import channelsModule from './modules/channels'
import presenceModule from './modules/presence'

export const store = createStore({
  modules: {
    auth,
    channels: channelsModule,
    presence: presenceModule,
  },
})

export type RootState = ReturnType<typeof store.state>
export default store
