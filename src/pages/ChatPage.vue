<template>
  <q-page class="chat-page">
    <div
      class="messages-area"
      ref="messagesContainer"
      @scroll="onScroll"
    >
      <div class="messages-list">
        <MessageItem
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :current-user="currentUser"
          :current-user-id="currentUserId || undefined"
          :user-id="message.userId"
        />
      </div>

      <!-- Go to latest button -->
      <div v-if="!isAtBottom && messages.value.length" class="go-to-latest">
        <q-btn
          dense
          outline
          color="primary"
          label="↓ Go to latest"
          @click="scrollToLatest(true)"
        />
      </div>

      <!-- Typing users + draft preview -->
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
  nextTick,
} from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { api } from 'src/boot/axios'
import authService from 'src/services/auth.service'
import channelService from 'src/services/channel.service'
import MessageItem from '../components/MessageItem.vue'
import { useMessageNotifications } from '../services/messageNotifications'

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
const route = useRoute()
const store = useStore()
const { notifyOnMessage, ensurePermission } = useMessageNotifications()

const messagesContainer = ref<HTMLElement | null>(null)
const currentUser = ref<string>('me')
const currentUserId = ref<number | null>(null)
const currentChannel = ref<string>('')
const typingUsers = ref<{ userId: number; nick: string }[]>([])
const draftPreviews = ref<Record<number, string>>({})
const selectedPreviewUserId = ref<number | null>(null)
const messages = ref<ChatMessage[]>([])
const hasMore = ref(true)
const isLoading = ref(false)
const currentPage = ref(1)
const initialLoaded = ref(false)
const PAGE_SIZE = 20

const channelId = computed(() => {
  const id = Number(route.params.channelId)
  return Number.isNaN(id) ? null : id
})

const hasMessage = (id: number) => messages.value.some((m) => m.id === id)

/* Scroll logic */
const isAtBottom = computed(() => {
  const el = messagesContainer.value
  if (!el) return true
  return el.scrollHeight - (el.scrollTop + el.clientHeight) < 20
})

const shouldScrollToBottom = (senderIsSelf = false) => {
  const el = messagesContainer.value
  if (!el) return true
  const distance = el.scrollHeight - (el.scrollTop + el.clientHeight)
  return senderIsSelf || distance < 120
}

const scrollToLatest = (force = false) => {
  nextTick(() => {
    const el = messagesContainer.value
    if (!el) return
    if (force || isAtBottom.value) {
      el.scrollTop = el.scrollHeight
    }
  })
}

/* Map backend message to frontend */
const mapBackendMessage = (m: BackendMessage | any): ChatMessage => ({
  id: m.id,
  userId: m.userId ?? m.user_id ?? 0,
  author: m.authorNickName ?? m.author_nick_name ?? 'unknown',
  content: m.content,
  timestamp: new Date(m.createdAt ?? m.created_at),
  mentionedUser: m.mentionedUserNickName ?? m.mentioned_user_nick_name ?? null,
  mentionedUserId: m.mentionedUserId ?? m.mentioned_user_id ?? null,
})

/* Add message to list */
const addMessage = (msg: ChatMessage, notify = false, fromRealtime = true) => {
  if (hasMessage(msg.id)) return
  messages.value.push(msg)

  if (notify) {
    maybeNotifyMessage(msg)
  }

  const senderIsSelf = msg.userId === currentUserId.value
  if (fromRealtime && shouldScrollToBottom(senderIsSelf)) {
    scrollToLatest()
  }
}

/* Fetch messages (infinite scroll) */
async function fetchMessages(page: number) {
  if (channelId.value === null || isLoading.value) return
  isLoading.value = true

  try {
    const container = messagesContainer.value
    const prevHeight = container?.scrollHeight || 0

    const response = await api.get<{
      data: BackendMessage[]
      meta: { page: number; limit: number; hasMore: boolean }
    }>(`/channels/${channelId.value}/messages`, {
      params: { page, limit: PAGE_SIZE }
    })

    const backend = response.data.data
    const mapped = backend.map(mapBackendMessage)
    const deduped = mapped.filter((m) => !hasMessage(m.id))

    if (page === 1 && messages.value.length === 0) {
      messages.value = deduped
    } else {
      messages.value.unshift(...deduped)
    }

    hasMore.value = deduped.length >= (response.data.meta?.limit ?? PAGE_SIZE)
    currentPage.value = Math.max(currentPage.value, page)

    if (page === 1) {
      scrollToLatest()
    } else if (container) {
      nextTick(() => {
        const newHeight = container.scrollHeight
        const diff = newHeight - prevHeight
        if (diff > 0) container.scrollTop += diff
      })
    }

    return deduped.length
  } finally {
    isLoading.value = false
  }
}

/* Infinite scroll on scroll */
const onScroll = async () => {
  const el = messagesContainer.value
  if (!el || !hasMore.value || isLoading.value) return
  if (el.scrollTop < 200) {
    const nextPage = currentPage.value + 1
    await fetchMessages(nextPage)
  }
}

/* Socket getter */
const getSocket = () => {
  const internalInstance = getCurrentInstance()
  const inst = internalInstance?.appContext.config.globalProperties.$socket as any
  return inst || (window as any).$socket
}

/* Computed */
const userStatus = computed(() => store.state.presence?.selfStatus || 'online')
const notifyMentionsOnly = computed(
  () => store.state.auth?.user?.notificationMode === 'mentions_only'
)
const appVisible = computed(() => store.state.presence?.appVisible !== false)
const typingSummary = computed(() => {
  if (!typingUsers.value.length) return ''
  return typingUsers.value.map((u) => u.nick).join(', ') + ' is typing...'
})
const previewText = computed(() => {
  if (selectedPreviewUserId.value == null) return ''
  return draftPreviews.value[selectedPreviewUserId.value] || ''
})

/* Load user/channel meta */
async function loadMeta() {
  try {
    const me = await authService.me()
    currentUser.value = me.nickName
    currentUserId.value = me.id
  } catch (err) {
    console.error('Failed to load current user', err)
  }

  try {
    if (channelId.value !== null) {
      const channel = await channelService.getChannel(channelId.value)
      currentChannel.value = channel.name
    }
  } catch (err) {
    console.error('Failed to load channel', err)
    currentChannel.value =
      channelId.value !== null ? `channel-${channelId.value}` : ''
  }

  await ensurePermission()
}

/* Socket events */
function handleSocketMessage(payload: any) {
  if (!payload || channelId.value === null) return
  const msgChannelId = payload.channelId ?? payload.channel_id
  if (msgChannelId !== channelId.value || userStatus.value === 'offline') return
  addMessage(mapBackendMessage(payload), true)
}

function handleSocketTyping(payload: any) {
  if (!payload || channelId.value === null) return
  const msgChannelId = payload.channelId ?? payload.channel_id
  if (msgChannelId !== channelId.value) return

  const uid = Number(payload.userId)
  const nick = payload.nickName ?? `User ${uid}`
  if (payload.isTyping) {
    if (!typingUsers.value.find(u => u.userId === uid)) {
      typingUsers.value.push({ userId: uid, nick })
    }
  } else {
    typingUsers.value = typingUsers.value.filter(u => u.userId !== uid)
    delete draftPreviews.value[uid]
    if (selectedPreviewUserId.value === uid) selectedPreviewUserId.value = null
  }
}

function handleSocketDraft(payload: any) {
  if (!payload || channelId.value === null) return
  const msgChannelId = payload.channelId ?? payload.channel_id
  if (msgChannelId !== channelId.value) return

  const uid = Number(payload.userId)
  const text = payload.text?.toString() ?? ''
  if (!uid) return
  if (!text.trim()) delete draftPreviews.value[uid]
  else draftPreviews.value[uid] = text
}

function maybeNotifyMessage(msg: ChatMessage) {
  const uid = currentUserId.value
  if (!uid) return
  void notifyOnMessage({
    message: { ...msg },
    channelName:
      currentChannel.value || (channelId.value !== null ? `channel-${channelId.value}` : 'channel'),
    senderName: msg.author,
    currentUserId: uid,
    currentUserNick: currentUser.value,
    userStatus: userStatus.value,
    notifyMentionsOnly: notifyMentionsOnly.value,
    appVisible: appVisible.value,
  })
}

function handleSyncEvent(event: Event) {
  const detail = (event as CustomEvent<any>).detail
  if (!detail?.messages || channelId.value === null) return
  const items = detail.messages[String(channelId.value)] || []
  items.forEach((raw: any) => addMessage(mapBackendMessage(raw), false))
}

/* Mounted/unmounted */
onMounted(async () => {
  await loadMeta()
  await fetchMessages(1)
  currentPage.value = 1
  initialLoaded.value = true

  const socket = getSocket()
  if (socket) {
    socket.on('message', handleSocketMessage)
    socket.on('new_message', handleSocketMessage)
    socket.on('typing', handleSocketTyping)
    socket.on('draft_preview', handleSocketDraft)
  }

  window.addEventListener(SYNC_EVENT, handleSyncEvent as any)
  scrollToLatest(true)
})

onUnmounted(() => {
  const socket = getSocket()
  if (socket) {
    socket.off('message', handleSocketMessage)
    socket.off('new_message', handleSocketMessage)
    socket.off('typing', handleSocketTyping)
    socket.off('draft_preview', handleSocketDraft)
  }
  window.removeEventListener(SYNC_EVENT, handleSyncEvent as any)
})

/* Route change — reset + reload */
watch(
  () => route.params.channelId,
  async () => {
    messages.value = []
    typingUsers.value = []
    draftPreviews.value = {}
    selectedPreviewUserId.value = null
    hasMore.value = true
    currentPage.value = 1
    initialLoaded.value = false

    await loadMeta()
    await fetchMessages(1)
    initialLoaded.value = true
    scrollToLatest(true)
  }
)
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: var(--font-family);
  background: var(--color-bg);
  color: var(--color-text);
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 20px;
  scrollbar-width: thin;
  scrollbar-color: var(--color-accent) var(--color-bg-secondary);
}

.messages-area::-webkit-scrollbar {
  width: 8px;
}
.messages-area::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
}
.messages-area::-webkit-scrollbar-thumb {
  background-color: var(--color-accent);
  border-radius: 10px;
}

.typing-bar {
  position: sticky;
  bottom: 0;
  background-color: #1E1F29;
  color: var(--color-text);
  padding: 8px 12px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.4); 
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 10;
}

.typing-chip {
  cursor: pointer;
  background-color: #2A2C3B;
  padding: 4px 8px;
  border-radius: 6px;
  color: #ffffff;
  font-weight: 500;
}

.draft-preview {
  margin-top: 4px;
  background-color: #292B3B; 
  padding: 6px 10px;
  border-radius: 6px;
  color: #E0E0E0;
  font-style: italic;
  max-width: 80%;
  white-space: pre-wrap;
}


.go-to-latest {
  position: sticky;
  bottom: 60px;
  display: flex;
  justify-content: center;
  margin-bottom: 4px;
}
</style>
