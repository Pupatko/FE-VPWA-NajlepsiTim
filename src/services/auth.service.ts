import type { AxiosError, AxiosRequestConfig } from 'axios'
import { api } from 'src/boot/axios'

export interface User {
  id: number
  firstName: string
  lastName: string
  nickName: string
  email: string
  state: number // 1=online, 2=DND, 3=offline
  notificationMode: 'all' | 'mentions_only'
}

export interface RegisterData {
  firstName: string
  lastName: string
  nickName: string
  email: string
  password: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ApiToken {
  type: 'bearer'
  token: string
  expiresAt: string | null
}

export interface RegisterResponse {
  user: User
  token: string
  type: 'bearer'
  expiresAt: string | null
}

class AuthService {
  /**
   * Get current authenticated user
   */
  async me(dontTriggerLogout = false): Promise<User | null> {
    return api.get(
      '/auth/me',
      { dontTriggerLogout } as AxiosRequestConfig
    )
      .then((response) => response.data)
      .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          return null
        }

        if (!error.response) {
          return null
        }

        return Promise.reject(error)
      })
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', { // ✅ Opravený endpoint
      firstName: data.firstName,
      lastName: data.lastName,
      nickName: data.nickName,
      email: data.email,
      password: data.password
    })
    return response.data
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<ApiToken> {
    const response = await api.post<ApiToken>('/auth/login', credentials) // ✅ Opravený endpoint
    return response.data
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout') // ✅ Opravený endpoint
  }

  /**
   * Update user settings (notification mode)
   */
  async updateSettings(settings: { notificationMode?: 'all' | 'mentions_only' }): Promise<User> {
    const response = await api.put<User>('/users/me/settings', settings)
    return response.data
  }
}

export default new AuthService()
