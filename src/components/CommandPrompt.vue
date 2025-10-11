<template>
  <q-card class="command-prompt" flat bordered>
    <!-- Terminal Output -->
    <q-scroll-area class="terminal-output">
      <div class="q-pa-md">
        <div v-for="(line, index) in outputLines" :key="index" class="output-line">
          {{ line }}
        </div>
      </div>
    </q-scroll-area>

    <!-- Command Line Input -->
    <div class="command-line row items-center no-wrap">
      <span class="prompt">{{ promptSymbol }}</span>
      <q-input
        v-model="currentInput"
        borderless
        dense
        dark
        class="command-input"
        placeholder="enter command or message..."
        @keyup.enter="handleCommand"
        input-class="text-white"
        spellcheck="false"
      />
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  promptSymbol?: string
}

const props = withDefaults(defineProps<Props>(), {
  promptSymbol: '> '
})

const currentInput = ref('')
const outputLines = ref<string[]>([])

const handleCommand = () => {
  const input = currentInput.value.trim()
  if (!input) return

  if (input.startsWith('/')) {
    processCommand(input)
  } else {
    sendMessage(input)
  }
  currentInput.value = ''
}

const processCommand = (input: string) => {
  const parts = input.split(' ')
  const cmd = parts[0].toLowerCase()
  const args = parts.slice(1)

  switch (cmd) {
    case '/help':
      showHelp()
      break
    case '/join':
      outputLines.value.push(`TODO: join channel logic: ${args.join(' ')}`)
      break
    case '/quit':
      outputLines.value.push('TODO: delete channel logic')
      break
    case '/cancel':
      outputLines.value.push('TODO: leave channel logic')
      break
    case '/invite':
      if (args.length < 1) {
        outputLines.value.push('Usage: /invite <nickname>')
      } else {
        outputLines.value.push(`TODO: invite user logic for: ${args[0]}`)
      }
      break
    case '/revoke':
      if (args.length < 1) {
        outputLines.value.push('Usage: /revoke <nickname>')
      } else {
        outputLines.value.push(`TODO: revoke user logic for: ${args[0]}`)
      }
      break
    case '/kick':
      if (args.length < 1) {
        outputLines.value.push('Usage: /kick <nickname>')
      } else {
        outputLines.value.push(`TODO: kick user logic for: ${args[0]}`)
      }
      break
    case '/list':
      outputLines.value.push('TODO: list channel members logic')
      break
    default:
      outputLines.value.push(`Unknown command: ${input}`)
      outputLines.value.push('Type /help for available commands.')
  }
}

const showHelp = () => {
  outputLines.value.push('Available commands:')
  outputLines.value.push('/help - show available commands')
  outputLines.value.push('/join <channelname> [private] - join or create channel')
  outputLines.value.push('/quit - delete channel (admin only)')
  outputLines.value.push('/cancel - leave current channel')
  outputLines.value.push('/invite <nickname> - invite user')
  outputLines.value.push('/revoke <nickname> - remove user (admin only)')
  outputLines.value.push('/kick <nickname> - kick user')
  outputLines.value.push('/list - show channel members')
}

const sendMessage = (message: string) => {
  outputLines.value.push(`sending message: ${message}`)
}
</script>

<style lang="scss" scoped>
.command-prompt {
  height: 200px;
  background: $command-line-bg;
  display: flex;
  flex-direction: column;
}

.terminal-output {
  flex: 1;
  color: $text-inverse;
  font-family: monospace;
  font-size: 13px;
}

.output-line {
  margin: 3px 0;
  line-height: 1.3;
}

.command-line {
  padding: 12px;
  border-top: 1px solid rgba($border-light, 0.3);
  background: $command-line-bg;
}

.prompt {
  color: $positive;
  font-weight: bold;
  font-size: 14px;
  margin-right: 8px;
  font-family: monospace;
}

.command-input {
  flex: 1;
  font-family: monospace;
  font-size: 14px;
  
  :deep(.q-field__control) {
    color: $text-inverse;
  }
  
  :deep(.q-field__native) {
    color: $text-inverse;
  }
  
  :deep(::placeholder) {
    color: $text-muted;
  }
}
</style>
