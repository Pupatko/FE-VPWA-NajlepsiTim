<template>
  <q-page class="chat-page">
    <div class="messages-area" ref="messagesContainer">
      <q-infinite-scroll
        ref="infiniteScrollRef"
        @load="onLoad"
        reverse
      >
        <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner color="primary" name="dots" size="40px" />
          </div>
        </template>

        <MessageItem
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :current-user="currentUser"
        />
      </q-infinite-scroll>

      <TypingIndicator :users="typingUsers" />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  getCurrentInstance,
  computed,
} from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import authService from 'src/services/auth.service'
import channelService from 'src/services/channel.service'
import MessageItem from '../components/MessageItem.vue'
import TypingIndicator from '../components/TypingIndicator.vue'
import { messageNotifications } from '../services/messageNotifications'

interface BackendMessage {
  id: number
  content: string
  createdAt: string
  userId: number
  mentionedUserId: number | null
  authorNickName: string
  mentionedUserNickName?: string | null
  channelId: number
}

interface ChatMessage {
  id: number
  author: string
  content: string
  timestamp: Date
  mentionedUser?: string | null
}

const $q = useQuasar()
const route = useRoute()

const internalInstance = getCurrentInstance()
const socket = internalInstance?.appContext.config.globalProperties.$socket as any

const currentUser = ref<string>('me')
const currentChannel = ref<string>('') // názov kanála z backendu
const typingUsers = ref<string[]>([])
const messages = ref<ChatMessage[]>([])
const hasMore = ref(true)
const isLoading = ref(false)

const infiniteScrollRef = ref<any | null>(null)

const channelId = computed(() => {
  const id = Number(route.params.channelId)
  return Number.isNaN(id) ? null : id
})

// načítanie info o userovi a kanáli
async function loadMeta() {
  try {
    const me = await authService.me()
    currentUser.value = me.nickName
  } catch (error) {
    console.error('Failed to load current user', error)
  }

  try {
    if (channelId.value !== null) {
      const channel = await channelService.getChannel(channelId.value)
      currentChannel.value = channel.name
    }
  } catch (error) {
    console.error('Failed to load channel info', error)
    currentChannel.value = channelId.value !== null ? `channel-${channelId.value}` : ''
  }

  messageNotifications.init($q)
}

// načítanie jednej strany správ z backendu
async function fetchMessages(page: number) {
  if (channelId.value === null) return

  const response = await api.get<{
    data: BackendMessage[]
    meta: { page: number; limit: number; hasMore: boolean }
  }>(`/channels/${channelId.value}/messages`, {
    params: { page, limit: 20 },
  })

  const backendMessages = response.data.data

  const mapped: ChatMessage[] = backendMessages.map((m) => ({
    id: m.id,
    author: m.authorNickName,
    content: m.content,
    timestamp: new Date(m.createdAt),
    mentionedUser: m.mentionedUserNickName ?? null,
  }))

  if (page === 1 && messages.value.length === 0) {
    messages.value = mapped
  } else {
    messages.value.unshift(...mapped)
  }

  hasMore.value = response.data.meta.hasMore
}

// handler pre <q-infinite-scroll>
const onLoad = async (index: number, done: () => void) => {
  if (isLoading.value || !hasMore.value) {
    done()
    return
  }

  isLoading.value = true
  try {
    await fetchMessages(index)
  } catch (error) {
    console.error('Failed to load messages', error)
    $q.notify({
      type: 'negative',
      message: 'Nepodarilo sa načítať správy',
    })
  } finally {
    isLoading.value = false
    done()
  }
}

// handler pre realtime správy zo Socket.IO
function handleSocketMessage(payload: any) {
  if (!payload || channelId.value === null) return

  const msgChannelId = payload.channelId ?? payload.channel_id
  if (msgChannelId !== channelId.value) return

  const chatMessage: ChatMessage = {
    id: payload.id,
    author:
      payload.authorNickName ??
      payload.author_nick_name ??
      'unknown',
    content: payload.content,
    timestamp: new Date(payload.createdAt ?? payload.created_at),
    mentionedUser:
      payload.mentionedUserNickName ??
      payload.mentioned_user_nick_name ??
      null,
  }

  messages.value.push(chatMessage)
}

// handler pre typing eventy
function handleSocketTyping(payload: any) {
  if (!payload || channelId.value === null) return

  const msgChannelId = payload.channelId ?? payload.channel_id
  if (msgChannelId !== channelId.value) return

  const name: string =
    payload.nickName ?? `User ${payload.userId ?? 'unknown'}`

  if (payload.isTyping) {
    if (!typingUsers.value.includes(name)) {
      typingUsers.value.push(name)
    }
  } else {
    typingUsers.value = typingUsers.value.filter((n) => n !== name)
  }
}

onMounted(async () => {
  await loadMeta()

  if (socket) {
    socket.on('message', handleSocketMessage)
    socket.on('typing', handleSocketTyping)
  }
})

onUnmounted(() => {
  if (socket) {
    socket.off('message', handleSocketMessage)
    socket.off('typing', handleSocketTyping)
  }
})

// notifikácie pri nových správach
watch(
  () => messages.value.length,
  (newLength, oldLength) => {
    if (newLength > oldLength && messages.value.length > 0) {
      const latestMessage = messages.value[messages.value.length - 1]

      if (latestMessage.author !== currentUser.value) {
        messageNotifications.notifyNewMessage(
          latestMessage as any,
          currentChannel.value || (channelId.value !== null ? `channel-${channelId.value}` : 'channel'),
          currentUser.value
        )
      }
    }
  }
)

// pri prepnutí na iný kanál resetneme správy + infinite scroll
watch(
  () => route.params.channelId,
  async () => {
    messages.value = []
    typingUsers.value = []
    hasMore.value = true

    if (infiniteScrollRef.value) {
      infiniteScrollRef.value.reset()
      infiniteScrollRef.value.resume()
    }

    await loadMeta()
  }
)
</script>

<style lang="scss" scoped>
.chat-page {
  height: 100%;
}

.messages-area {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  background-color: $chat-bg;
}
</style>
