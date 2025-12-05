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
          :user-id="message.userId"
        />
      </q-infinite-scroll>

      <div v-if="typingUsers.length" class="typing-bar">
        <div class="text-caption text-grey-4">{{ typingSummary }}</div>
        <div class="row q-gutter-sm">
          <div
            v-for="user in typingUsers"
            :key="user.userId"
            class="typing-chip"
            @click="selectedPreviewUserId = user.userId"
          >
            {{ user.nick }}
          </div>
        </div>
        <div v-if="previewText" class="draft-preview">
          {{ previewText }}
        </div>
      </div>
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
import { useStore } from 'vuex'
import { api } from 'src/boot/axios'
import authService from 'src/services/auth.service'
import channelService from 'src/services/channel.service'
import MessageItem from '../components/MessageItem.vue'
import { messageNotifications } from '../services/messageNotifications'

interface BackendMessage {
  id: number
  content: string
  createdAt: string
  userId: number
  user_id?: number
  mentionedUserId: number | null
  authorNickName: string
  mentionedUserNickName?: string | null
  channelId: number
  channel_id?: number
}

interface ChatMessage {
  id: number
  userId: number
  author: string
  content: string
  timestamp: Date
  mentionedUser?: string | null
  mentionedUserId?: number | null
}

const SYNC_EVENT = 'chat:sync'

const $q = useQuasar()
const route = useRoute()
const store = useStore()

const getSocket = () => {
  const internalInstance = getCurrentInstance()
  const instanceSocket = internalInstance?.appContext.config.globalProperties.$socket as any
  return instanceSocket || (window as any).$socket
}

const currentUser = ref<string>('me')
const currentUserId = ref<number | null>(null)
const currentChannel = ref<string>('') // channel name from backend
const typingUsers = ref<{ userId: number; nick: string }[]>([])
const draftPreviews = ref<Record<number, string>>({})
const selectedPreviewUserId = ref<number | null>(null)
const messages = ref<ChatMessage[]>([])
const hasMore = ref(true)
const isLoading = ref(false)

const infiniteScrollRef = ref<any | null>(null)

const channelId = computed(() => {
  const id = Number(route.params.channelId)
  return Number.isNaN(id) ? null : id
})
const hasMessage = (id: number) => messages.value.some((m) => m.id === id)

const mapBackendMessage = (m: BackendMessage | any): ChatMessage => ({
  id: m.id,
  userId: m.userId ?? m.user_id ?? 0,
  author: m.authorNickName ?? m.author_nick_name ?? 'unknown',
  content: m.content,
  timestamp: new Date(m.createdAt ?? m.created_at),
  mentionedUser: m.mentionedUserNickName ?? m.mentioned_user_nick_name ?? null,
  mentionedUserId: m.mentionedUserId ?? m.mentioned_user_id ?? null,
})

const addMessage = (msg: ChatMessage, notify = false) => {
  if (hasMessage(msg.id)) return
  messages.value.push(msg)
  if (notify) {
    maybeNotifyMessage(msg)
  }
}
const userStatus = computed(() => store.state.presence?.selfStatus || 'online')
const notifyMentionsOnly = computed(
  () => store.state.auth?.user?.notificationMode === 'mentions_only'
)
const appVisible = computed(() => store.state.presence?.appVisible !== false)

// load user/channel meta
async function loadMeta() {
  try {
    const me = await authService.me()
    currentUser.value = me.nickName
    currentUserId.value = me.id
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

// load one page of messages
async function fetchMessages(page: number) {
  if (channelId.value === null) return

  const response = await api.get<{
    data: BackendMessage[]
    meta: { page: number; limit: number; hasMore: boolean }
  }>(`/channels/${channelId.value}/messages`, {
    params: { page, limit: 20 },
  })

  const backendMessages = response.data.data

  const mapped: ChatMessage[] = backendMessages
    .map((m) => mapBackendMessage(m))
    .filter((m) => !hasMessage(m.id))

  if (page === 1 && messages.value.length === 0) {
    messages.value = mapped
  } else {
    messages.value.unshift(...mapped)
  }

  hasMore.value = response.data.meta.hasMore
}

// handler for infinite scroll
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
      message: 'Failed to load messages',
    })
  } finally {
    isLoading.value = false
    done()
  }
}

// realtime messages
function handleSocketMessage(payload: any) {
  if (!payload || channelId.value === null) return

  const msgChannelId = payload.channelId ?? payload.channel_id
  if (msgChannelId !== channelId.value) return

  const chatMessage = mapBackendMessage(payload)
  addMessage(chatMessage, true)
}

// typing handler
function handleSocketTyping(payload: any) {
  if (!payload || channelId.value === null) return

  const msgChannelId = payload.channelId ?? payload.channel_id
  if (msgChannelId !== channelId.value) return

  const uid = Number(payload.userId)
  const name: string = payload.nickName ?? `User ${uid || 'unknown'}`

  if (payload.isTyping) {
    if (!typingUsers.value.find((u) => u.userId === uid)) {
      typingUsers.value.push({ userId: uid, nick: name })
    }
  } else {
    typingUsers.value = typingUsers.value.filter((u) => u.userId !== uid)
    delete draftPreviews.value[uid]
    if (selectedPreviewUserId.value === uid) {
      selectedPreviewUserId.value = null
    }
  }
}

// draft preview handler
function handleSocketDraft(payload: any) {
  if (!payload || channelId.value === null) return
  const msgChannelId = payload.channelId ?? payload.channel_id
  if (msgChannelId !== channelId.value) return

  const uid = Number(payload.userId)
  const text = payload.text?.toString() ?? ''
  if (!uid) return

  if (text.trim().length === 0) {
    delete draftPreviews.value[uid]
    return
  }

  draftPreviews.value[uid] = text
}

function maybeNotifyMessage(msg: ChatMessage) {
  const uid = currentUserId.value
  if (!uid) return

  messageNotifications.notifyNewMessage({
    message: { ...msg },
    channelName: currentChannel.value || (channelId.value !== null ? `channel-${channelId.value}` : 'channel'),
    senderName: msg.author,
    currentUserId: uid,
    userStatus: userStatus.value,
    notifyMentionsOnly: notifyMentionsOnly.value,
    appVisible: appVisible.value,
  })
}

function handleSyncEvent(event: Event) {
  const detail = (event as CustomEvent<any>).detail
  if (!detail?.messages || channelId.value === null) return
  const key = String(channelId.value)
  const items = detail.messages[key] || []
  items.forEach((raw: any) => {
    const mapped = mapBackendMessage(raw)
    addMessage(mapped, false)
  })
}

onMounted(async () => {
  await loadMeta()

  const socketInstance = getSocket()
  if (socketInstance) {
    socketInstance.on('message', handleSocketMessage)
    socketInstance.on('new_message', handleSocketMessage)
    socketInstance.on('typing', handleSocketTyping)
    socketInstance.on('draft_preview', handleSocketDraft)
  }

  window.addEventListener(SYNC_EVENT, handleSyncEvent as any)
})

onUnmounted(() => {
  const socketInstance = getSocket()
  if (socketInstance) {
    socketInstance.off('message', handleSocketMessage)
    socketInstance.off('new_message', handleSocketMessage)
    socketInstance.off('typing', handleSocketTyping)
    socketInstance.off('draft_preview', handleSocketDraft)
  }
  window.removeEventListener(SYNC_EVENT, handleSyncEvent as any)
})

// reset on channel change
watch(
  () => route.params.channelId,
  async () => {
    messages.value = []
    typingUsers.value = []
    draftPreviews.value = {}
    selectedPreviewUserId.value = null
    hasMore.value = true

    if (infiniteScrollRef.value) {
      infiniteScrollRef.value.reset()
      infiniteScrollRef.value.resume()
    }

    await loadMeta()
  }
)

const typingSummary = computed(() => {
  if (!typingUsers.value.length) return ''
  const names = typingUsers.value.map((u) => u.nick)
  return `${names.join(', ')} is typing...`
})

const previewText = computed(() => {
  if (selectedPreviewUserId.value == null) return ''
  return draftPreviews.value[selectedPreviewUserId.value] || ''
})
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

.typing-bar {
  position: sticky;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  color: $text-inverse;
  padding: 6px 12px;
  border-radius: $border-radius;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.typing-chip {
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: $border-radius;
}

.draft-preview {
  margin-top: 2px;
  background: rgba(255, 255, 255, 0.06);
  padding: 8px;
  border-radius: $border-radius;
  color: $text-inverse;
}
</style>
