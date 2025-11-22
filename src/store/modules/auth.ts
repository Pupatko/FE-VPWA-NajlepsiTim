import { Module } from 'vuex'
import { authService, authManager } from 'src/services'
import type { User } from 'src/contracts/auth'
import type { LoginCredentials, RegisterData } from 'src/contracts/auth'

interface AuthState {
  user: User | null
}

const auth: Module<AuthState, any> = {
  namespaced: true,
  state: (): AuthState => ({
    user: null
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    user: (state) => state.user
  },
  mutations: {
    SET_USER (state, user: User) {
      state.user = user
    },
    CLEAR_USER (state) {
      state.user = null
    }
  },
  actions: {
    async check ({ commit }) {
      const user = await authService.me(true)
      if (user) {
        commit('SET_USER', user)
        return true
      }

      commit('CLEAR_USER')
      return false
    },

    async login ({ commit }, credentials: LoginCredentials) {
      const token = await authService.login(credentials)
      authManager.setToken(token.token)

      const user = await authService.me()
      commit('SET_USER', user)
      return user
    },

    async register({ dispatch }, data) {
      await authService.register(data)

      // auto login immediately
      await dispatch('login', {
        email: data.email,
        password: data.password,
        remember: false
      })
    },

    async logout({ commit }) {
      await authService.logout()
      authManager.removeToken()
      commit('CLEAR_USER')
    }
  }
}

export default auth
