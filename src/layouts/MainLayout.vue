<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="q-px-md q-py-sm">
        <!-- left side with menu toggle -->
        <q-btn
          dense
          flat
          round
          icon="menu"
          @click="toggleLeftDrawer"
          class="q-mr-sm"
          aria-label="Toggle menu"
        />

        <q-toolbar-title class="text-weight-bold">
          # {{ currentChannel || 'Choose a channel' }}
        </q-toolbar-title>

        <!-- right side -->
        <div class="row items-center q-gutter-sm">
          <q-btn
            flat
            round
            dense
            icon="account_circle"
            @click="Profile"
            aria-label="Profile"
          />
          <q-btn
            flat
            round
            dense
            icon="settings"
            @click="Settings"
            aria-label="Settings"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      side="left"
      bordered
      class="custom-drawer"
    >
      <ChannelPanel />
    </q-drawer>

    <q-page-container class="custom-page-container q-px-md q-pt-md">
      <router-view />
    </q-page-container>

    <q-footer class="footer-container">
      <div class="message-input-wrapper q-px-md q-py-sm">
        <MessageInput
          @toggle-members="toggleMembers"
          @send="handleSendMessage"
          @typing="handleTyping"
          @draft="handleDraft"
        />
      </div>
    </q-footer>

    <!-- Floating scroll-to-bottom button -->
    <q-btn
      v-if="showScrollToBottom && isInChat"
      fab
      flat
      unelevated
      icon="keyboard_arrow_down"
      class="scroll-bottom-btn scroll-bottom-styled"
      @click="scrollToBottom"
    />
  </q-layout>
</template>

<script lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, getCurrentInstance } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import ChannelPanel from '../components/ChannelPanel.vue'
import MessageInput from '../components/MessageInput.vue'
import { api } from 'src/boot/axios'
import channelService from 'src/services/channel.service'

export default {
  components: {
    ChannelPanel,
    MessageInput,
  },
  setup() {
    const leftDrawerOpen = ref(false)
    const userStatus = ref('online')
    const currentUser = ref('user123')
    const currentChannel = ref('')

    const router = useRouter()
    const route = useRoute()
    const $q = useQuasar()

    const internalInstance = getCurrentInstance()
    const getSocket = () => {
      const s = internalInstance?.appContext.config.globalProperties.$socket as any
      return s && s.connected ? s : null
    }

    const showScrollToBottom = ref(false)

    const scrollToBottom = () => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      })
    }

    const isInChat = computed(() => route.path.startsWith('/channels/'))

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight
      const fullHeight = document.documentElement.scrollHeight
      showScrollToBottom.value = fullHeight - scrollPosition > 200
    }

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    const handleChannelSelect = (channelId: string | number) => {
      router.push(`/channels/${channelId}`)
    }

    const updateCurrentChannelFromRoute = async () => {
      const channelIdParam = route.params.channelId
      const channelId = Number(channelIdParam)

      if (!channelId || Number.isNaN(channelId)) {
        currentChannel.value = ''
        return
      }

      try {
        const channel = await channelService.getChannel(channelId)
        currentChannel.value = channel.name
      } catch (error) {
        console.error('Failed to load channel info', error)
        currentChannel.value = ''
      }
    }

    const handleSendMessage = async (message: string) => {
      const trimmed = message.trim()

      // command?
      const isCommand = trimmed.startsWith('/')

      const socket = getSocket()

      const channelIdParam = route.params.channelId
      const channelId = Number(channelIdParam)

      try {
        // /join via socket
        if (isCommand && trimmed.startsWith('/join')) {
          if (!socket) {
            $q.notify({ type: 'negative', message: 'WebSocket nie je pripojeny.' })
            return
          }

          const parts = trimmed.split(/\s+/)
          const channelName = parts[1]
          const rawFlag = parts[2]?.replace(/\[|\]/g, '').toLowerCase()
          const isPrivate = rawFlag === 'private'

          if (!channelName) {
            $q.notify({ type: 'warning', message: 'Pouzitie: /join channelName [private]' })
            return
          }

          socket.emit(
            'command:join',
            {
              channelName,
              private: isPrivate,
            },
            (response: any) => {
              if (!response?.ok) {
                $q.notify({
                  type: 'negative',
                  message: response?.error || 'Chyba pri /join',
                })
                return
              }

              const newId = response.result?.channelId
              if (newId) {
                router.push(`/channels/${newId}`)
              }

              if (response.result?.message) {
                $q.notify({ type: 'positive', message: response.result.message })
              }
            }
          )

          return
        }

        // /quit via socket
        if (isCommand && trimmed.startsWith('/quit')) {
          if (!socket) {
            $q.notify({ type: 'negative', message: 'WebSocket nie je pripojeny.' })
            return
          }

          if (!channelId || Number.isNaN(channelId)) {
            $q.notify({ type: 'warning', message: 'Najprv si vyber kanal vlavo v zozname' })
            return
          }

          socket.emit(
            'command:quit',
            { channelId },
            (response: any) => {
              if (!response?.ok) {
                $q.notify({
                  type: 'negative',
                  message: response?.error || 'Chyba pri /quit',
                })
                return
              }

              $q.notify({ type: 'positive', message: response.result?.message || 'Channel deleted' })
              router.push('/')
            }
          )

          return
        }

        // /revoke via socket
        if (isCommand && trimmed.startsWith('/revoke')) {
          if (!socket) {
            $q.notify({ type: 'negative', message: 'WebSocket nie je pripojeny.' })
            return
          }

          if (!channelId || Number.isNaN(channelId)) {
            $q.notify({ type: 'warning', message: 'Najprv si vyber kanal vlavo v zozname' })
            return
          }

          const parts = trimmed.split(/\s+/)
          const nickname = parts[1]

          if (!nickname) {
            $q.notify({ type: 'warning', message: 'Pouzitie: /revoke nickname' })
            return
          }

          socket.emit(
            'command:revoke',
            { channelId, nickname },
            (response: any) => {
              if (!response?.ok) {
                $q.notify({
                  type: 'negative',
                  message: response?.error || 'Chyba pri /revoke',
                })
                return
              }
              $q.notify({ type: 'positive', message: response.result?.message || 'User revoked' })
            }
          )

          return
        }

        // /kick via socket
        if (isCommand && trimmed.startsWith('/kick')) {
          if (!socket) {
            $q.notify({ type: 'negative', message: 'WebSocket nie je pripojeny.' })
            return
          }

          if (!channelId || Number.isNaN(channelId)) {
            $q.notify({ type: 'warning', message: 'Najprv si vyber kanal vlavo v zozname' })
            return
          }

          const parts = trimmed.split(/\s+/)
          const nickname = parts[1]

          if (!nickname) {
            $q.notify({ type: 'warning', message: 'Pouzitie: /kick nickname' })
            return
          }

          socket.emit(
            'command:kick',
            { channelId, nickname },
            (response: any) => {
              if (!response?.ok) {
                $q.notify({
                  type: 'negative',
                  message: response?.error || 'Chyba pri /kick',
                })
                return
              }
              $q.notify({ type: 'positive', message: response.result?.message || 'User kicked' })
            }
          )

          return
        }

        // other commands (still REST)
        if (isCommand) {
          if (trimmed.startsWith('/invite')) {
            if (!socket) {
              $q.notify({ type: 'negative', message: 'WebSocket nie je pripojeny.' })
              return
            }

            if (!channelId || Number.isNaN(channelId)) {
              $q.notify({ type: 'warning', message: 'Najprv si vyber kanal vlavo v zozname' })
              return
            }

            const parts = trimmed.split(/\s+/)
            const nickname = parts[1]

            if (!nickname) {
              $q.notify({ type: 'warning', message: 'Pouzitie: /invite nickname' })
              return
            }

            socket.emit(
              'command:invite',
              { channelId, nickname },
              (response: any) => {
                if (!response?.ok) {
                  $q.notify({
                    type: 'negative',
                    message: response?.error || 'Chyba pri /invite',
                  })
                  return
                }
                $q.notify({ type: 'positive', message: response.result?.message || 'Invite sent' })
              }
            )

            return
          }

          if (!channelId || Number.isNaN(channelId)) {
            $q.notify({ type: 'warning', message: 'Najprv si vyber kanal vlavo v zozname' })
            return
          }

          const { data } = await api.post('/ws/command', {
            channelId,
            content: trimmed,
          })

          if (trimmed.startsWith('/list')) {
            router.push(`/channels/${channelId}/members`)
            return
          }

          if (trimmed.startsWith('/cancel')) {
            router.push('/')
          }

          const msg = data?.message || data?.result || data?.info || 'Prikaz bol spracovany'
          $q.notify({ type: 'positive', message: msg })

          if (data?.channelId) {
            router.push(`/channels/${data.channelId}`)
          }

          return
        }

        // normal message (REST for now)
        if (!channelId || Number.isNaN(channelId)) {
          $q.notify({
            type: 'warning',
            message: 'Najprv si vyber kanal vlavo v zozname',
          })
          return
        }

        await api.post('/ws/message', {
          channelId,
          content: trimmed,
        })
        // clear draft preview for others
        if (socket) {
          socket.emit('draft:update', { channelId, text: '' })
        }
      } catch (error: any) {
        console.error('send failed', error)
        $q.notify({
          type: 'negative',
          message: error?.response?.data?.message || 'Nepodarilo sa odoslat spravu / prikaz',
        })
      }
    }

    const handleTyping = (isTyping: boolean) => {
      const channelIdParam = route.params.channelId
      const channelId = Number(channelIdParam)

      const socket = getSocket()
      if (!socket || !channelId || Number.isNaN(channelId)) {
        return
      }

      socket.emit('typing:update', {
        channelId,
        isTyping,
      })
    }

    const handleDraft = (text: string) => {
      const channelIdParam = route.params.channelId
      const channelId = Number(channelIdParam)

      const socket = getSocket()
      if (!socket || !channelId || Number.isNaN(channelId)) {
        return
      }

      socket.emit('draft:update', {
        channelId,
        text,
      })
    }

    const toggleMembers = () => {
      const channelId = route.params.channelId
      if (channelId) router.push(`/channels/${channelId}/members`)
    }


    const Settings = () => {
      router.push('/settings')
    }

    const Profile = () => {
      router.push('/profile')
    }

    onMounted(() => {
      window.addEventListener('scroll', handleScroll)
      updateCurrentChannelFromRoute()
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    watch(
      () => route.params.channelId,
      () => {
        updateCurrentChannelFromRoute()
      }
    )

    return {
      leftDrawerOpen,
      userStatus,
      currentUser,
      currentChannel,
      toggleLeftDrawer,
      Settings,
      Profile,
      handleChannelSelect,
      handleSendMessage,
      handleTyping,
      handleDraft,
      toggleMembers,
      showScrollToBottom,
      scrollToBottom,
      isInChat,
    }
  },
}
</script>

<style lang="scss" scoped>
.custom-drawer {
  background-color: $sidebar-bg !important;
  border-right: 1px solid $border-light;
}

.custom-page-container {
  background-color: $chat-bg;
  color: $text-primary;
  padding-bottom: 180px;
}

.footer-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.96);
  box-shadow: 0 -6px 18px rgba(0, 0, 0, 0.12);
}

.message-input-wrapper {
  background-color: $message-area-bg;
  border-top: 1px solid $border-light;
  position: relative;
}

.scroll-bottom-styled {
  background: white !important;
  border: 2px solid #9b4dff !important;
  color: #9b4dff !important;
}

.scroll-bottom-btn {
  position: fixed;
  bottom: 95px;
  right: 24px;
  z-index: 2000;
  width: 56px;
  height: 56px;
  border-radius: 50%;
}
</style>
