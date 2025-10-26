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

    <q-page-container class="custom-page-container" :class="{ expanded: isTerminalHidden }">
      <router-view />
    </q-page-container>

    <q-footer class="footer-container">
      <div class="message-input-wrapper">
        <MessageInput 
          :cmd-visible="!isTerminalHidden"
          @toggle-cmd="toggleTerminal"
          @send="handleSendMessage" 
          @typing="handleTyping" 
        />
        
        <!-- typing indicator below input -->
        <!-- placeholder for typing indicator -->
      </div>
      
      <div class="command-prompt-wrapper" :class="{ collapsed: isTerminalHidden }">
        <CommandPrompt 
          @toggle-visibility="toggleTerminal"
          @send="handleSendMessage" 
          @command="handleCommand" 
        />
      </div>
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CommandPrompt from '../components/CommandPrompt.vue'
import ChannelPanel from '../components/ChannelPanel.vue'
import MessageInput from '../components/MessageInput.vue'
// import TypingIndicator from '../components/TypingIndicator.vue'

export default {
  components: {
    CommandPrompt,
    ChannelPanel,
    MessageInput,
    // TypingIndicator
  },
  setup() {
    const leftDrawerOpen = ref(false)
    const userStatus = ref('online')
    const currentUser = ref('user123')
    const currentChannel = ref('general')
    // const typingUsers = ref([]) // track who is typing
    
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
      // todo: send via websocket or api
    }

    const handleCommand = (command) => {
      console.log('todo: execute command:', command)
      // todo: handle commands like /join, /leave, etc
    }

    const handleTyping = (isTyping) => {
      console.log('todo: handle typing:', isTyping)
      // todo: broadcast typing status to other users via websocket
    }

    const isTerminalHidden = ref(false)
    const toggleTerminal = () => {
      isTerminalHidden.value = !isTerminalHidden.value
    }

    
    const router = useRouter();

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
      // typingUsers,
      toggleLeftDrawer,
      Settings,
      Profile,
      handleChannelSelect,
      handleSendMessage,
      handleCommand,
      handleTyping,
      isTerminalHidden,
      toggleTerminal
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

.command-prompt-wrapper {
  background-color: $command-line-bg;
  border-top: 1px solid $border-light;
  
  &.collapsed {
    height: 0px;
    overflow: hidden;
  }
}
</style>
