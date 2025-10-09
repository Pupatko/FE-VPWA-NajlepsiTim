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

<script lang="ts">
import { ref, onMounted } from 'vue'
import MessageItem from '../components/MessageItem.vue'
import TypingIndicator from '../components/TypingIndicator.vue'

export default {
  components: {
    MessageItem,
    TypingIndicator
  },
  setup() {
    const currentUser = ref('me')
    const typingUsers = ref([])
    
    const messages = ref([
      {
        id: '1',
        author: 'roman123',
        content: 'hey everyone! how is it going?',
        timestamp: new Date(Date.now() - 10000)
      },
      {
        id: '2',
        author: 'roman321',
        content: 'pretty good! working on this chat app',
        timestamp: new Date(Date.now() - 9000)
      },
      {
        id: '3',
        author: 'me',
        content: 'nice! looks great so far',
        timestamp: new Date(Date.now() - 8000)
      },
    ])

    // load older messages - load multiple at once
    const onLoad = (index, done) => {
      console.log('loading older messages...')
      
      setTimeout(() => {
        // load 10 messages at once
        const newMessages = []
        for (let i = 0; i < 10; i++) {
          newMessages.push({
            id: `old-${index}-${i}`,
            author: i % 3 === 0 ? 'me' : `user${i}`,
            content: `older message ${index * 10 + i}`,
            timestamp: new Date(Date.now() - 20000 - (index * 10000) - (i * 1000))
          })
        }
        
        // add to beginning
        messages.value.splice(0, 0, ...newMessages)
        
        // stop after 50 loads (500 messages total)
        if (index > 50) {
          done(true)
        } else {
          done()
        }
      }, 1000)
    }

    onMounted(() => {
      console.log('chat page ready')
    })

    return {
      messages,
      typingUsers,
      currentUser,
      onLoad
    }
  }
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
