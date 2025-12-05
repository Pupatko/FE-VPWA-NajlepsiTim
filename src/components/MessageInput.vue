<template>
  <div class="message-input-container q-pa-md">
    <q-input
      v-model="messageText"
      filled
      dense
      placeholder="Type a message..."
      class="message-input rounded-borders shadow-1"
      input-class="text-body1"
      @keyup.enter="sendMessage"
      @keyup="handleTyping"
      @input="handleDraft"
      clearable
      color="primary"
    >

      <template v-slot:prepend>
        <div class="row items-center q-gutter-sm">
          <q-btn
            flat
            round
            dense
            icon="group"
            color="primary"
            @click="toggleMembers"
            aria-label="Show channel members"
          >
            <q-tooltip>Show channel members</q-tooltip>
          </q-btn>
        </div>
      </template>

      <!-- 🔹 APPEND: Send tlačidlo -->
      <template v-slot:append>
        <q-btn
          flat
          round
          dense
          icon="send"
          color="primary"
          @click="sendMessage"
          :disable="!messageText.trim()"
          aria-label="Send message"
        />
      </template>
    </q-input>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'

export default {
  emits: ['send', 'typing', 'toggle-members', 'draft'],
  setup(props, { emit }) {
    const messageText = ref('')
    let typingTimeout: number | null = null

    const sendMessage = () => {
      if (messageText.value.trim()) {
        emit('send', messageText.value.trim())
        // clear draft on send
        emit('draft', '')
        messageText.value = ''
      }
    }

    const handleTyping = () => {
      emit('typing', true)
      emit('draft', messageText.value)

      if (typingTimeout) clearTimeout(typingTimeout)

      typingTimeout = window.setTimeout(() => {
        emit('typing', false)
      }, 2000)
    }

    const toggleMembers = () => {
      emit('toggle-members', true)
    }

    const handleDraft = () => {
      emit('draft', messageText.value)
    }

    return {
      messageText,
      sendMessage,
      handleTyping,
      toggleMembers,
      handleDraft,
    }
  }
}
</script>

<style lang="scss" scoped>
.message-input-container {
  background-color: $message-area-bg;
}

.message-input {
  width: 100%;
}

@media (max-width: 768px) {
  .message-input-container {
    padding: 12px;
  }
}
</style>
