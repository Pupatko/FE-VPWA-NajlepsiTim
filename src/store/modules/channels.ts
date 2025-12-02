import { Module } from 'vuex'
import type { RootState } from '../index'
import { api } from 'src/boot/axios'

export interface Channel {
  id: number
  name?: string
  private?: boolean
  ownerId?: number
  isOwner?: boolean
  joinedAt?: string
  invited?: boolean
  pinned?: boolean
  lastActivityAt?: string | null
}

export interface ChannelsState {
  list: Channel[]
}

const state = (): ChannelsState => ({
  list: []
})

const mutations = {
  SET_CHANNELS(state: ChannelsState, channels: Channel[]) {
    state.list = channels
  },
  ADD_CHANNEL(state: ChannelsState, ch: Channel) {
    const idx = state.list.findIndex(c => c.id === ch.id)
    if (idx === -1) {
      // Pridaj na začiatok pre lepšiu viditeľnosť
      state.list = [ch, ...state.list]
    } else {
      // Update existujúci - vytvor nové pole pre reaktivitu
      state.list = [
        ...state.list.slice(0, idx),
        { ...state.list[idx], ...ch },
        ...state.list.slice(idx + 1)
      ]
    }
  },
  REMOVE_CHANNEL(state: ChannelsState, channelId: number) {
    state.list = state.list.filter(c => c.id !== channelId)
  },
  UPDATE_CHANNEL(state: ChannelsState, ch: Partial<Channel> & { id: number }) {
    const idx = state.list.findIndex(c => c.id === ch.id)
    if (idx !== -1) {
      // Vytvor nové pole pre reaktivitu
      state.list = [
        ...state.list.slice(0, idx),
        { ...state.list[idx], ...ch },
        ...state.list.slice(idx + 1)
      ]
    }
  }
}

const actions = {
  async fetchMyChannels({ commit }: any) {
    const res = await api.get<Channel[]>('/my-channels')
    commit('SET_CHANNELS', res.data)
  },
  async createChannel({ commit }: any, payload: { name: string; private: boolean }) {
    const res = await api.post<Channel>('/channels', payload)
    commit('ADD_CHANNEL', res.data)
    return res.data
  },
  handleChannelCreated({ commit }: any, channel: Channel) {
    commit('ADD_CHANNEL', channel)
  },
  handleChannelUpdated({ commit }: any, channel: Channel) {
    commit('UPDATE_CHANNEL', channel)
  },
  handleChannelRemoved({ commit }: any, channelId: number) {
    commit('REMOVE_CHANNEL', channelId)
  },
  handleChannelInvited({ commit }: any, payload: any) {
    // Môžeš tu zobraziť notifikáciu o invite
    console.log('Channel invitation received:', payload)
    // Ak chceš pridať kanál po invite:
    // commit('ADD_CHANNEL', payload)
  },
  handleChannelLeft({ commit }: any, payload: any) {
    // User opustil kanál
    console.log('User left channel:', payload)
    if (payload.channelId) {
      commit('REMOVE_CHANNEL', payload.channelId)
    }
  },
  handleMessageNew({ commit, state }: any, payload: any) {
    // Nová správa - môžeš tu updatnúť lastActivityAt
    console.log('New message in channel:', payload)
    if (payload.channelId) {
      const channel = state.list.find((c: Channel) => c.id === payload.channelId)
      if (channel) {
        commit('UPDATE_CHANNEL', {
          id: payload.channelId,
          lastActivityAt: new Date().toISOString()
        })
      }
    }
  },
  handleChannelClosed({ commit, dispatch }: any, payload: any) {
    // Kanál bol zatvorený - odstráň ho a presmeruj usera
    console.log('Channel closed, removing from list:', payload.channelId)
    commit('REMOVE_CHANNEL', payload.channelId)
    
    // Ak je user práve v tomto kanáli, presmeruj ho
    // Toto spraví router v komponente, ktorý počúva na store changes
  }
}

export const channelsModule: Module<ChannelsState, RootState> = {
  namespaced: true,
  state,
  mutations,
  actions
}

export default channelsModule