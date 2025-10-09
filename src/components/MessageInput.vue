<template>
  <div class="message-input-container">
    <q-input
      v-model="messageText"
      outlined
      placeholder="type a message..."
      class="message-input"
      @keyup.enter="sendMessage"
      @keyup="handleTyping"
      bg-color="white"
    >
      <template v-slot:append>
        <q-btn 
          flat 
          round 
          dense 
          icon="send"
          color="primary"
          @click="sendMessage"
          :disable="!messageText.trim()"
        />
      </template>
    </q-input>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'

export default {
  emits: ['send', 'typing'],
  setup(props, { emit }) {
    const messageText = ref('')
    let typingTimeout: number | null = null

    // send message when enter is pressed or send button clicked
    const sendMessage = () => {
      if (messageText.value.trim()) {
        emit('send', messageText.value.trim())
        messageText.value = ''
      }
    }

    // emit typing event with debounce
    const handleTyping = () => {
      emit('typing', true)

      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }

      typingTimeout = window.setTimeout(() => {
        emit('typing', false)
      }, 2000)
    }

    return {
      messageText,
      sendMessage,
      handleTyping
    }
  }
}
</script>

<style lang="scss" scoped>
.message-input-container {
  padding: 16px;
  background-color: $message-area-bg;
}

.message-input {
  width: 100%;
  padding-left: 20px;
  
  ::v-deep .q-field__control {
    border-radius: $border-radius;
  }

  ::v-deep .q-field__native {
    color: $text-primary;
  }
}

@media (max-width: 768px) {
  .message-input-container {
    padding: 12px;
  }
}
</style>
