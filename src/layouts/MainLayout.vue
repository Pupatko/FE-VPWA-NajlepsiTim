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
        
        <!-- typing indicator below input -->
        <!-- placeholder for typing indicator -->
      </div>
    
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { ref, onMounted, watch } from 'vue'
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
    const currentChannel = ref('') // už nie 'general' napevno

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

    // 🔥 Funkcia, ktorá načíta názov kanála podľa ID z route
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
        // PRÍKAZY (/join, /invite, /kick, ...)
        if (message.startsWith('/')) {
          const { data } = await api.post('/ws/command', {
            content: message,
          })

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

.typing-indicator-container {
  padding: 0 16px 8px 16px;
}
</style>
