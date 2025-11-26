import { Module } from 'vuex'
import { api } from 'src/boot/axios'
import type { RootState } from 'src/store' // optional type

interface Channel {
  id: number
  name: string
  private?: boolean
  ownerId?: number
  isOwner?: boolean
  joinedAt?: string
  invited?: boolean  // frontend flag: was invited
  pinned?: boolean   // invite pinned to top
  lastActivityAt?: string | null
}

interface ChannelsState {
  list: Channel[]
}

const channels: Module<ChannelsState, any> = {
  namespaced: true,
  state: (): ChannelsState => ({
    list: []
  }),
  getters: {
    sortedChannels: (state) => {
      // invites first (pinned), then by latest message/joined (customizable)
      const pinned = state.list.filter(c => c.pinned)
      const others = state.list.filter(c => !c.pinned)
      // simple: sort others by joinedAt desc if present
      others.sort((a, b) => {
        const aa = a.lastActivityAt ?? a.joinedAt ?? ''
        const bb = b.lastActivityAt ?? b.joinedAt ?? ''
        return bb.localeCompare(aa)
      })
      return [...pinned, ...others]
    }
  },
  mutations: {
    SET_CHANNELS (state, channels: Channel[]) {
      state.list = channels
    },
    ADD_CHANNEL (state, ch: Channel) {
      // avoid duplicates
      if (!state.list.some(c => c.id === ch.id)) {
        state.list.push(ch)
      } else {
        state.list = state.list.map(c => (c.id === ch.id ? { ...c, ...ch } : c))
      }
    },
    REMOVE_CHANNEL (state, channelId: number) {
      state.list = state.list.filter(c => c.id !== channelId)
    },
    UPDATE_CHANNEL (state, ch: Channel) {
      state.list = state.list.map(c => (c.id === ch.id ? { ...c, ...ch } : c))
    },
    PIN_CHANNEL (state, channelId: number) {
      state.list = state.list.map(c => (c.id === channelId ? { ...c, pinned: true, invited: true } : { ...c, pinned: false }))
    },
    UNPIN_CHANNEL (state, channelId: number) {
      state.list = state.list.map(c => (c.id === channelId ? { ...c, pinned: false, invited: false } : c))
    }
  },
  actions: {
    async fetchMyChannels ({ commit }) {
      const res = await api.get('/my-channels')
      // server returns array as you posted earlier
      commit('SET_CHANNELS', res.data)
    },
    async fetchPublicChannels ({ commit }) {
      const res = await api.get('/channels/public')
      // you may want to merge public channels not in user's list
      // not done here
      return res.data
    },

    // ---- socket event handlers ----
    handleChannelCreated ({ commit }, payload) {
      // payload: channel object
      commit('ADD_CHANNEL', payload)
    },
    handleChannelInvited ({ commit }, payload) {
      // payload must contain channel; mark pinned and move top
      const channel = payload.channel ?? payload
      commit('ADD_CHANNEL', { ...channel, invited: true })
      commit('PIN_CHANNEL', channel.id)
    },
    handleChannelRemoved ({ commit }, payload) {
      // payload might contain channelId or channel object
      const id = payload.channelId ?? payload.id
      if (id) commit('REMOVE_CHANNEL', id)
    },
    handleChannelUpdated ({ commit }, payload) {
      commit('UPDATE_CHANNEL', payload)
    },
    handleChannelLeft ({ commit }, payload) {
      const id = payload.channelId ?? payload.id
      if (id) commit('REMOVE_CHANNEL', id)
    },
    handleChannelKicked ({ commit }, payload) {
      const id = payload.channelId ?? payload.id
      if (id) {
        commit('REMOVE_CHANNEL', id)
        // optional: notify user handled by component
      }
    },
    handleMessageNew ({ commit }, payload) {
      // payload should contain channelId and maybe lastActivityAt
      const id = payload.channelId ?? payload.channel?.id
      if (!id) return
      commit('UPDATE_CHANNEL', { id, lastActivityAt: payload.lastActivityAt ?? new Date().toISOString() })
    },

    // user actions that emit socket events (or call API if you prefer)
    async leaveChannel ({ dispatch }, channelId: number) {
      // API fallback: call REST
      try {
        await api.post(`/channels/${channelId}/leave`)
      } catch (e) {
        // swallow or rethrow
      }
      // optimistic update — server should broadcast channel:left
      dispatch('handleChannelLeft', { channelId })
    },

    async deleteChannel ({ dispatch }, channelId: number) {
      await api.delete(`/channels/${channelId}`)
      dispatch('handleChannelRemoved', { channelId })
    },

    async createChannel ({ commit }, payload: { name: string, private: boolean }) {
      const res = await api.post('/channels', payload)
      commit('ADD_CHANNEL', res.data)
      return res.data
    }
  }
}

export default channels
