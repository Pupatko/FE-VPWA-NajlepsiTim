<template>
  <q-page class="chat-page">
    <div class="messages-area">
      <q-infinite-scroll @load="onLoad" reverse>
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
        />
      </q-infinite-scroll>

      <TypingIndicator :users="typingUsers" />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import MessageItem from '../components/MessageItem.vue'
import TypingIndicator from '../components/TypingIndicator.vue'
import { messageNotifications } from '../services/messageNotifications'

const $q = useQuasar()
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

const allUsers = ['Ed', 'Alice', 'Bob', 'Charlie', 'Dana']
let simulationInterval = null

const simulateRandomTyping = () => {
  const randomCount = Math.floor(Math.random() * 3)
  
  if (randomCount === 0) {
    typingUsers.value = []
  } else {
    const shuffled = [...allUsers].sort(() => 0.5 - Math.random())
    typingUsers.value = shuffled.slice(0, randomCount)
  }
}

onMounted(async () => {
  messageNotifications.init($q)
  
  simulateRandomTyping()
  simulationInterval = setInterval(simulateRandomTyping, 10000)
  
  setTimeout(() => {
    const newMessage = {
      id: messages.value.length + 1,
      author: 'john123',
      content: 'Hey @me, check this out!',
      timestamp: new Date()
    }
    messages.value.push(newMessage)
  }, 5000)
})

onUnmounted(() => {
  if (simulationInterval) {
    clearInterval(simulationInterval)
  }
})

watch(() => messages.value.length, (newLength, oldLength) => {
  if (newLength > oldLength) {
    const latestMessage = messages.value[messages.value.length - 1]
    
    if (latestMessage.author !== currentUser.value) {
      messageNotifications.notifyNewMessage(
        latestMessage,
        currentChannel.value,
        currentUser.value
      )
    }
  }
})

const onLoad = (index, done) => {
  setTimeout(() => {
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
