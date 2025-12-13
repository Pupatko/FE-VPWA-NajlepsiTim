import { Module } from 'vuex'
import type { RootState } from '../index'

export type PresenceStatus = 'online' | 'dnd' | 'offline'

export interface PresenceState {
  byUserId: Record<number, PresenceStatus>
  selfStatus: PresenceStatus
  appVisible: boolean
  lastSyncAt: string | null
}

const loadPreferredStatus = (): PresenceStatus => {
  if (typeof window === 'undefined') return 'offline'
  const saved = localStorage.getItem('preferredStatus')
  if (saved === 'online' || saved === 'dnd' || saved === 'offline') {
    return saved as PresenceStatus
  }
  return 'offline'
}

const loadLastSyncAt = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('lastSyncAt')
}

const persistPreferredStatus = (status: PresenceStatus) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('preferredStatus', status)
  } catch (e) {
    console.warn('Failed to persist preferredStatus', e)
  }
}

const persistLastSyncAt = (value: string | null) => {
  if (typeof window === 'undefined') return
  try {
    if (value) {
      localStorage.setItem('lastSyncAt', value)
    } else {
      localStorage.removeItem('lastSyncAt')
    }
  } catch (e) {
    console.warn('Failed to persist lastSyncAt', e)
  }
}

const state = (): PresenceState => ({
  byUserId: {},
  selfStatus: loadPreferredStatus(),
  appVisible: true,
  lastSyncAt: loadLastSyncAt(),
})

const resetState = (state: PresenceState) => {
  state.byUserId = {}
  state.selfStatus = 'offline'
  state.appVisible = true
  state.lastSyncAt = null
  persistPreferredStatus('offline')
  persistLastSyncAt(null)
}

const mutations = {
  SET_STATUS(state: PresenceState, payload: { userId: number; status: PresenceStatus }) {
    const { userId, status } = payload
    if (!userId) return
    state.byUserId = { ...state.byUserId, [userId]: status }
  },
  SET_SELF_STATUS(state: PresenceState, status: PresenceStatus) {
    state.selfStatus = status
    persistPreferredStatus(status)
  },
  SET_APP_VISIBLE(state: PresenceState, visible: boolean) {
    state.appVisible = visible
  },
  SET_LAST_SYNC(state: PresenceState, value: string | null) {
    state.lastSyncAt = value
    persistLastSyncAt(value)
  },
  RESET_STATE(state: PresenceState) {
    resetState(state)
  },
}

const actions = {
  setStatus({ commit }: any, payload: { userId: number; status: PresenceStatus }) {
    commit('SET_STATUS', payload)
  },
  setSelfStatus({ commit, rootState }: any, status: PresenceStatus) {
    const userId = rootState?.auth?.user?.id
    if (userId) {
      commit('SET_STATUS', { userId, status })
    }
    commit('SET_SELF_STATUS', status)
  },
  setAppVisibility({ commit }: any, visible: boolean) {
    commit('SET_APP_VISIBLE', visible)
  },
  setLastSyncAt({ commit }: any, value: string | null) {
    commit('SET_LAST_SYNC', value)
  },
  reset({ commit }: any) {
    commit('RESET_STATE')
  },
}

const getters = {
  statusFor: (state: PresenceState) => (userId: number): PresenceStatus | undefined =>
    state.byUserId[userId],
}

export const presenceModule: Module<PresenceState, RootState> = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}

export default presenceModule
