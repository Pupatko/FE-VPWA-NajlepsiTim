import type { AxiosError, AxiosRequestConfig } from 'axios'
import type { ApiToken, LoginCredentials, RegisterData, User } from 'src/contracts'
import { api } from 'src/boot/axios'

class AuthService {
  async me (dontTriggerLogout = false): Promise<User | null> {
    return api.get(
      'auth/me',
      { dontTriggerLogout } as AxiosRequestConfig
    )
      .then((response) => response.data)
      .catch((error: AxiosError) => {
        // If server responded with 401 -> not authenticated
        if (error.response?.status === 401) {
          return null
        }

        // If there's no response (network error, backend down), treat as not authenticated
        if (!error.response) {
          return null
        }

        return Promise.reject(error)
      })
  }

  async register (data: RegisterData): Promise<User> {
    const response = await api.post<User>('auth/register', data)
    return response.data
  }

  async login (credentials: LoginCredentials): Promise<ApiToken> {
    const response = await api.post<ApiToken>('auth/login', credentials)
    return response.data
  }

  async logout (): Promise<void> {
    await api.post('auth/logout')
  }
}

export default new AuthService()