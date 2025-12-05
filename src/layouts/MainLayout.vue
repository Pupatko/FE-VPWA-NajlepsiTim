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
        />
      </div>
    </q-footer>

    <!-- 🔥 FLOATING SCROLL-TO-BOTTOM BUTTON -->
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
import { ref, onMounted, watch, onUnmounted, computed, getCurrentInstance } from 'vue'
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

    // 🔥 Funkcia ktorá prescrolluje na spodok
    const scrollToBottom = () => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      })
    }

    // 🔥 Sme v chat kanáli?
    const isInChat = computed(() => route.path.startsWith('/channels/'))

    // 🔥 Listener na window scroll – funguje aj pri QLayout, QPageContainer, QFooter, router-view
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight
      const fullHeight = document.documentElement.scrollHeight

      // zobrazíme button, ak je user hore viac ako 200px
      showScrollToBottom.value = fullHeight - scrollPosition > 200
    }

    onMounted(() => {
      window.addEventListener('scroll', handleScroll)
      updateCurrentChannelFromRoute()
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    const handleChannelSelect = (channelId) => {
      router.push(`/channels/${channelId}`)
    }

    const parseSlashCommand = (raw: string) => {
      const trimmed = raw.trim()
      if (!trimmed.startsWith('/')) {
        return null
      }

      const parts = trimmed.split(/\s+/)
      const name = parts[0].substring(1).toLowerCase()
      const args = parts.slice(1)

      return { command: name, args }
    }

    // Funkcia, ktora nacita nazov kanala podla ID z route
    // 🔥 Načítanie názvu kanála podľa ID
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

    watch(() => route.params.channelId, () => {
      updateCurrentChannelFromRoute()
    })

    const handleSendMessage = async (message) => {
      const trimmed = message.trim()

      // prikaz?
      const isCommand = trimmed.startsWith('/')

      // priprav WebSocket
      const socket = getSocket()

      const channelIdParam = route.params.channelId
      const channelId = Number(channelIdParam)

      if (message.startsWith('/join')) {
        try {
          const { data } = await api.post('/ws/command', {
            content: message
          })

          $q.notify({
            type: 'positive',
            message: data.message || 'Pripojené do kanála',
          })

          if (data.channelId) {
            router.push(`/channels/${data.channelId}`)
          }

        } catch (error) {
          $q.notify({
            type: 'negative',
            message: error?.response?.data?.message || 'Join príkaz zlyhal',
          })
        }

        return
      }

      if (message.startsWith('/join')) {
        try {
          const { data } = await api.post('/ws/command', {
            content: message
          })

          $q.notify({
            type: 'positive',
            message: data.message || 'Pripojené do kanála',
          })

          if (data.channelId) {
            router.push(`/channels/${data.channelId}`)
          }

        } catch (error) {
          $q.notify({
            type: 'negative',
            message: error?.response?.data?.message || 'Join príkaz zlyhal',
          })
        }

        return
      }

      try {
        // ********************************************
        // 1) WEBSOCKET /join - NEPOTREBUJE channelId
        // ********************************************
        if (isCommand && trimmed.startsWith('/join')) {
          if (!socket) {
            console.warn('send: /join without active socket')
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

      try {
        if (message.startsWith('/')) {
          const { data } = await api.post('/ws/command', {
            content: message,
            channelId
          })

          // špeciálne pre /list
          if (message.startsWith('/list')) {
            router.push(`/channels/${channelId}/members`)
            return
          }

          const msg =
            (data && (data.message || data.result || data.info)) ||
            'Príkaz bol spracovaný'

          $q.notify({
            type: 'positive',
            message: msg,
          })

          // ak príkaz vrátil channelId (napr. /join), presmeruj do kanála
          if (data && data.channelId) {
            router.push(`/channels/${data.channelId}`)
          }

          return
        }

        // BEŽNÁ SPRÁVA
        const { data } = await api.post('/ws/message', {
          channelId,
          content: message,
        })
        console.log('message sent', data)
      } catch (error: any) {
        console.error('send failed', error)
        $q.notify({
          type: 'negative',
          message:
            error?.response?.data?.message ||
            'Nepodarilo sa odoslať správu / príkaz',
        })
      }
    }


    const handleTyping = async (isTyping) => {
      const channelIdParam = route.params.channelId
      const channelId = Number(channelIdParam)

      if (!channelId || Number.isNaN(channelId)) return

      try {
        await api.post('/ws/typing', {
          channelId,
          isTyping,
        })
      } catch (error) {
        console.error('typing failed', error)
      }
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

    // 🔄 Pri prvom načítaní layoutu nastav názov kanála podľa aktuálnej route
    onMounted(() => {
      updateCurrentChannelFromRoute()
    })

    // 🔄 Pri každom prepnutí kanála (zmena route parametra) obnov názov
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
      toggleMembers,
      showScrollToBottom,
      scrollToBottom,
      isInChat
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
  
  &.expanded {
    flex: 1 1 auto; /* rozťahne sa na celú výšku */
  }
}

.app-title {
  font-size: 20px;
  font-weight: bold;
  color: white;
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
  border: 2px solid #9b4dff !important; /* tvoje fialové PS */
  color: #9b4dff !important; /* ikonka fialová */
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
