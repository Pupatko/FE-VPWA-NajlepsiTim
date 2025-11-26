import { api } from 'src/boot/axios'

export interface Channel {
  id: number
  name: string
  private: boolean
  ownerId: number
  isOwner: boolean
  joinedAt: string
}

export interface CreateChannelData {
  name: string
  private: boolean
}

class ChannelService {
  /**
   * Get user's channels
   */
  async getMyChannels(): Promise<Channel[]> {
    const response = await api.get<Channel[]>('/my-channels')
    return response.data
  }

  /**
   * Get public channels
   */
  async getPublicChannels(): Promise<Channel[]> {
    const response = await api.get<Channel[]>('/channels/public')
    return response.data
  }

  /**
   * Get channel detail
   */
  async getChannel(channelId: number): Promise<Channel> {
    const response = await api.get<Channel>(`/channels/${channelId}`)
    return response.data
  }

  /**
   * Join or create channel
   */
  async joinChannel(data: CreateChannelData): Promise<any> {
    const response = await api.post('/join', data)
    return response.data
  }

  /**
   * Leave channel
   */
  async leaveChannel(channelId: number): Promise<void> {
    await api.post('/leave', { channelId })
  }

  /**
   * Delete/quit channel (owner only)
   */
  async quitChannel(channelId: number): Promise<void> {
    await api.post('/quit', { channelId })
  }
}

export default new ChannelService()
