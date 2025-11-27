<template>
  <q-layout view="lHh Lpr lFf" style="background: $chat-bg">
    <q-header elevated>
      <q-toolbar>

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
        
        <q-toolbar-title>
          # {{ currentChannel }}
        </q-toolbar-title>

        <!-- right side -->
          <div class="q-gutter-x-md">
            <q-btn
              flat
              round
              icon="account_circle"
              @click="Profile"
              aria-label="Profile"
            />
          </div>

        <div class="q-gutter-x-md">
          <q-btn
            flat
            round
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

    <q-page-container class="custom-page-container">
      <router-view />
    </q-page-container>

    <q-footer class="footer-container">
      <div class="message-input-wrapper">
        <MessageInput 
          @toggle-members="toggleMembers"
          @send="handleSendMessage" 
          @typing="handleTyping" 
        />
        
        <!-- typing indicator below input -->
        <!-- placeholder for typing indicator -->
      </div>
    
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import ChannelPanel from '../components/ChannelPanel.vue'
import MessageInput from '../components/MessageInput.vue'
import { api } from 'src/boot/axios'

export default {
  components: {
    ChannelPanel,
    MessageInput,
  },
  setup() {
    const leftDrawerOpen = ref(false)
    const userStatus = ref('online')
    const currentUser = ref('user123')
    const currentChannel = ref('general')

    const channels = ref([
      { id: '1', name: 'general', type: 'public', unread: 0 },
      { id: '2', name: 'random', type: 'public', unread: 3 },
      { id: '3', name: 'private-room', type: 'private', unread: 1 },
    ])

    const router = useRouter()
    const route = useRoute()
    const $q = useQuasar()

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    const handleChannelSelect = (channelId: string | number) => {
      router.push(`/channels/${channelId}`)
    }

    const handleSendMessage = async (message: string) => {
      const channelIdParam = route.params.channelId
      const channelId = Number(channelIdParam)

      if (!channelId || Number.isNaN(channelId)) {
        $q.notify({
          type: 'warning',
          message: 'Najprv si vyber kanál vľavo v zozname',
        })
        return
      }

      try {
        // príkazy začínajú na "/"
        if (message.startsWith('/')) {
          const { data } = await api.post('/ws/command', {
            channelId,
            content: message,
          })

          const msg =
            (data && (data.message || data.result || data.info)) ||
            'Príkaz bol spracovaný'

          $q.notify({
            type: 'positive',
            message: msg,
          })
        } else {
          // bežná správa
          const { data } = await api.post('/ws/message', {
            channelId,
            content: message,
          })
          console.log('message sent', data)
          // TODO: neskôr ju pridáme realtime do ChatPage cez Socket.IO klienta
        }
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

    const handleTyping = async (isTyping: boolean) => {
      const channelIdParam = route.params.channelId
      const channelId = Number(channelIdParam)

      if (!channelId || Number.isNaN(channelId)) {
        return
      }

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
      router.push('/list')
    }

    const Settings = () => {
      router.push('/settings')
    }

    const Profile = () => {
      router.push('/profile')
    }

    return {
      leftDrawerOpen,
      userStatus,
      currentUser,
      currentChannel,
      channels,
      toggleLeftDrawer,
      Settings,
      Profile,
      handleChannelSelect,
      handleSendMessage,
      handleTyping,
      toggleMembers,
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
  background-color: transparent;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
}

.message-input-wrapper {
  background-color: $message-area-bg;
  border-top: 1px solid $border-light;
  position: relative;
}

.typing-indicator-container {
  padding: 0 16px 8px 16px;
}

</style>
