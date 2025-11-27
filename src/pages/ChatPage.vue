<template>
  <q-page class="chat-page">
    <div class="messages-area">
      <q-infinite-scroll ref="infiniteScrollRef" @load="onLoad" reverse>
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
import { ref, onMounted, onUnmounted, watch } from 'vue'
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

const currentUser = ref<string>('me')
const currentChannel = ref<string>('') // názov kanála z backendu
const typingUsers = ref<string[]>([])
const messages = ref<ChatMessage[]>([])
const hasMore = ref(true)
const isLoading = ref(false)

const infiniteScrollRef = ref<any | null>(null)

// načítanie info o userovi a kanáli
async function loadMeta() {
  try {
    const me = await authService.me()
    currentUser.value = me.nickName
  } catch (error) {
    console.error('Failed to load current user', error)
  }

  try {
    const channelId = Number(route.params.channelId)
    if (!Number.isNaN(channelId)) {
      const channel = await channelService.getChannel(channelId)
      currentChannel.value = channel.name
    }
  } catch (error) {
    console.error('Failed to load channel info', error)
    currentChannel.value = `channel-${route.params.channelId}`
  }

  messageNotifications.init($q)
}

// načítanie jednej strany správ z backendu
async function fetchMessages(page: number) {
  const channelId = Number(route.params.channelId)
  if (Number.isNaN(channelId)) {
    return
  }

  const response = await api.get<{
    data: BackendMessage[]
    meta: { page: number; limit: number; hasMore: boolean }
  }>(`/channels/${channelId}/messages`, {
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
    // prvé načítanie
    messages.value = mapped
  } else {
    // staršie správy pridávame na začiatok (infinite scroll hore)
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

onMounted(async () => {
  await loadMeta()
})

onUnmounted(() => {
  // sem neskôr môžeme dať cleanup (zrušenie WS listenerov a pod.)
})

// notifikácie pri nových správach
watch(
  () => messages.value.length,
  (newLength, oldLength) => {
    if (newLength > oldLength && messages.value.length > 0) {
      const latestMessage = messages.value[messages.value.length - 1]

      if (latestMessage.author !== currentUser.value) {
        messageNotifications.notifyNewMessage(
          latestMessage,
          currentChannel.value || `channel-${route.params.channelId}`,
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
