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
      <!-- sipka na zapnutie cmd -->
      <template v-slot:prepend v-if="!cmdVisible">
        <q-btn
          flat
          round
          dense
          icon="arrow_upward"
          color="primary"
          class="toggle-cmd-btn"
          @click="toggleCmd"
        />
        <q-tooltip>{{'Show terminal'}}</q-tooltip>
      </template>

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
import { ref, watch } from 'vue'

export default {
  emits: ['send', 'typing', 'toggle-cmd'],
  props: {
    cmdVisible: { type: Boolean, default: false }
  },
  setup(props, { emit }) {
    const messageText = ref('')
    let typingTimeout: number | null = null

    const sendMessage = () => {
      if (messageText.value.trim()) {
        emit('send', messageText.value.trim())
        messageText.value = ''
      }
    }

    const handleTyping = () => {
      emit('typing', true)

      if (typingTimeout) clearTimeout(typingTimeout)

      typingTimeout = window.setTimeout(() => {
        emit('typing', false)
      }, 2000)
    }

    const toggleCmd = () => {
      emit('toggle-cmd', true)
    }

    return {
      messageText,
      sendMessage,
      handleTyping,
      toggleCmd
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

  .toggle-cmd-btn {
    margin-right: 8px;
  }
}

@media (max-width: 768px) {
  .message-input-container {
    padding: 12px;
  }
}
</style>
