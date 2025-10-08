<template>
  <q-layout view="lHh Lpr lFf" style="background: $chat-bg">
    <q-header elevated>
      <q-toolbar>

        <!-- 🔹 Ľavá strana -->
        <q-toolbar-title>
          ChannelName
        </q-toolbar-title>

        <!-- 🔹 Pravá strana -->
        <div class="q-gutter-x-md">
          <q-btn
            flat
            round
            icon="settings"
            @click="$router.push('/settings')"
            aria-label="Settings"
          />
          <q-btn
            flat
            round
            icon="account_circle"
            @click="$router.push('/login')"
            aria-label="User"
          />
        </div>

      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered class="custom-drawer">
      <!-- <channel-list /> -->
      <ChannelPanel />
    </q-drawer>

    <q-page-container class="custom-page-container">
      <router-view />
    </q-page-container>

    <q-footer class="footer-container">
      <div class="message-input-wrapper">
        <!-- <message-input /> -->
        <q-item>
          <!-- Placeholder for MessageInput -->
        </q-item>
      </div>
      <div class="command-prompt-wrapper">
        <CommandPrompt @send="handleSendMessage" @command="handleCommand" />
      </div>
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { ref } from 'vue'
import ChatPage from '../pages/ChatPage.vue'
import CommandPrompt from '../components/CommandPrompt.vue'
import ChannelPanel from '../components/ChannelPanel.vue'
// import MessageInput from '../components/MessageInput.vue'
// import ChatHeader from '../components/ChatHeader.vue'

export default {
  components: {
    CommandPrompt,
    ChannelPanel,
    // MessageInput,
    // ChatHeader
  },
  setup() {
    const leftDrawerOpen = ref(false)
    const userStatus = ref('online')
    const currentUser = ref('user123')
    const currentChannel = ref('general')
    const channels = ref([
      { id: '1', name: 'general', type: 'public', unread: 0 },
      { id: '2', name: 'random', type: 'public', unread: 3 },
      { id: '3', name: 'private-room', type: 'private', unread: 1 }
    ])

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    const handleChannelSelect = (channelId) => {
      console.log('todo: switch to channel:', channelId)
    }

    const handleSendMessage = (message) => {
      console.log('todo: send message:', message)
    }

    const handleCommand = (command) => {
      console.log('todo: execute command:', command)
    }

    const handleTyping = (isTyping) => {
      console.log('todo: handle typing:', isTyping)
    }

    return {
      leftDrawerOpen,
      userStatus,
      currentUser,
      currentChannel,
      channels,
      toggleLeftDrawer,
      handleChannelSelect,
      handleSendMessage,
      handleCommand,
      handleTyping
    }
  }
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
}

.command-prompt-wrapper {
  background-color: $command-line-bg;
  border-top: 1px solid $border-light;
}
</style>
