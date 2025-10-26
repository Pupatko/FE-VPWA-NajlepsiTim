<template>
  <q-page class="chat-page">
    <div class="messages-area">
      
      <q-infinite-scroll @load="onLoad" reverse>
        <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner color="primary" name="dots" size="40px" />
          </div>
        </template>

        <!-- messages list -->
        <MessageItem
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :current-user="currentUser"
        />
      </q-infinite-scroll>

      <!-- typing indicator -->
      <TypingIndicator 
        v-if="typingUsers.length > 0"
        :users="typingUsers"
      />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import MessageItem from '../components/MessageItem.vue'
import TypingIndicator from '../components/TypingIndicator.vue'
import { messageNotifications } from '../services/messageNotifications'

const currentUser = ref('me')
const currentChannel = ref('general')
const typingUsers = ref([])
const messages = ref([
  {
    id: 1,
    author: 'roman123',
    content: 'hey everyone! how is it going?',
    timestamp: new Date(Date.now() - 10000)
  },
  {
    id: 2,
    author: 'roman321',
    content: 'pretty good! working on this chat app',
    timestamp: new Date(Date.now() - 9000)
  },
  {
    id: 3,
    author: 'me',
    content: 'nice! looks great so far',
    timestamp: new Date(Date.now() - 8000)
  }
])

// initialize notification service
onMounted(async () => {
  await messageNotifications.init()
  
  // simulate new message after 5 seconds for testing
  setTimeout(() => {
    const newMessage = {
      id: messages.value.length + 1,
      author: 'john123',
      content: 'Hey @me, check this out!',
      timestamp: new Date()
    }
    messages.value.push(newMessage)
    
    // show notification
    messageNotifications.notifyNewMessage(
      newMessage,
      currentChannel.value,
      currentUser.value
    )
  }, 5000)
})

// watch for new messages when using websocket or api
watch(() => messages.value.length, (newLength, oldLength) => {
  if (newLength > oldLength) {
    const latestMessage = messages.value[messages.value.length - 1]
    
    // show notification only if message is not from current user
    if (latestMessage.author !== currentUser.value) {
      messageNotifications.notifyNewMessage(
        latestMessage,
        currentChannel.value,
        currentUser.value
      )
    }
  }
})

// load older messages for infinite scroll
const onLoad = (index, done) => {
  setTimeout(() => {
    // simulate loading older messages
    const olderMessages = [
      {
        id: messages.value.length + 1,
        author: 'oldUser',
        content: 'This is an older message',
        timestamp: new Date(Date.now() - 20000)
      }
    ]
    
    messages.value.unshift(...olderMessages)
    done()
  }, 1000)
}
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
