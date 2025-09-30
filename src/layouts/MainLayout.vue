<template>
  <q-layout view="lHh Lpr lFf">
    
    <q-header class="custom-header">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" class="text-white" />
        
        <q-toolbar-title class="text-white">
          <q-avatar>
            <q-icon name="chat" />
          </q-avatar>
          bondragerchat
        </q-toolbar-title>

        <user-status 
          v-model="userStatus" 
          :nickname="currentUser" 
        />
      </q-toolbar>
    </q-header>

    <q-drawer 
      show-if-above 
      v-model="leftDrawerOpen" 
      side="left" 
      bordered 
      class="custom-drawer"
    >
      <channel-list 
        :channels="channels"
        :current-channel="currentChannel"
        @channel-select="handleChannelSelect"
      />
    </q-drawer>

    <q-page-container class="custom-page-container">
      <router-view />
    </q-page-container>

    <q-footer class="command-prompt-wrapper">
      <command-prompt 
        @send="handleSendMessage"
        @command="handleCommand"
      />
    </q-footer>

  </q-layout>
</template>

<script lang="ts">
import { ref } from 'vue'
import CommandPrompt from '../components/CommandPrompt.vue'
import ChannelList from '../components/ChannelList.vue'
import UserStatus from '../components/UserStatus.vue'

export default {
  components: {
    CommandPrompt,
    ChannelList,
    UserStatus
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
      // todo: implement channel switching logic
    }

    const handleSendMessage = (message) => {
      console.log('todo: send message:', message)
      // todo: implement message sending
    }

    const handleCommand = (command) => {
      console.log('todo: execute command:', command)
      // todo: implement command execution
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
      handleCommand
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-header {
  background-color: $primary !important;
  box-shadow: $shadow-medium;
  
  .q-toolbar {
    color: $text-inverse;
  }
}

.custom-drawer {
  background-color: $sidebar-bg !important;
  border-right: 1px solid $border-light;
}

.custom-page-container {
  background-color: $chat-bg;
  color: $text-primary;
}

.command-prompt-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: $message-area-bg;
  border-top: 1px solid $border-light;
  padding: 8px;
}
</style>
