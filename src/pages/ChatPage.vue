<template>
  <q-page class="chat-page">
    <!-- messages area -->
    <div class="messages-area" ref="messagesContainer">
      <!-- load more button -->
      <div v-if="hasOlderMessages" class="load-more">
        <q-btn 
          flat 
          @click="loadOlderMessages" 
          :loading="loadingMessages"
          class="load-more-btn"
        >
          load older messages
        </q-btn>
      </div>

      <!-- messages list -->
      <div v-for="message in messages" :key="message.id">
        <q-item>
          <!-- Placeholder for MessageItem -->
        </q-item>
      </div>

      <!-- typing indicator -->
      <q-item v-if="someoneTyping">
        <!-- Placeholder for TypingIndicator -->
      </q-item>
    </div>
  </q-page>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const messagesContainer = ref(null)
    const loadingMessages = ref(false)
    const hasOlderMessages = ref(true)
    const typingUsers = ref(['alice', 'bob'])
    const someoneTyping = ref(false)
    const currentUser = ref('me')
    
    const messages = ref([
      {
        id: '1',
        author: 'roman123',
        content: 'random2341',
        timestamp: new Date(Date.now() - 10)
      },
      {
        id: '2',
        author: 'roman321',
        content: 'random4312',
        timestamp: new Date(Date.now() - 9)
      },
      {
        id: '3',
        author: 'roman231',
        content: 'random1234',
        timestamp: new Date(Date.now() - 8)
      },
    ])

    const loadOlderMessages = async () => {
      loadingMessages.value = true
      
      console.log('todo: load older messages from server')
      
      setTimeout(() => {
        const olderMessages = [
          {
            id: '1',
            author: 'roman',
            content: 'random',
            timestamp: new Date(Date.now() - 1)
          },
          {
            id: '2',
            author: 'roman',
            content: 'random',
            timestamp: new Date(Date.now() - 2)
          }
        ]
        
        messages.value.unshift(...olderMessages)
        loadingMessages.value = false
        
        if (messages.value.length > 10) {
          hasOlderMessages.value = false
        }
      }, 1000)
    }

    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    onMounted(() => {
      console.log('todo: initialize chat page')
      scrollToBottom()
    })

    return {
      messages,
      messagesContainer,
      loadingMessages,
      hasOlderMessages,
      typingUsers,
      someoneTyping,
      currentUser,
      loadOlderMessages
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: $chat-bg;
  padding-bottom: 24px; // for the message input space

  .load-more {
    text-align: center;
    margin-bottom: 16px;

    .load-more-btn {
      color: $primary;
    }
  }
}

@media (max-width: 768px) {
  .messages-area {
    padding: 12px;
    padding-bottom: 24px;
  }
}
</style>
