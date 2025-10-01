<template>
  <div class="command-prompt">
    <div class="terminal-output" ref="outputArea">
      <div v-for="(line, index) in outputLines" :key="index" class="output-line">
        {{ line }}
      </div>
    </div>

    <div class="command-line">
      <span class="prompt">{{ promptSymbol }}</span>
      <input 
        ref="inputField"
        v-model="currentInput"
        class="command-input"
        @keyup.enter="handleCommand"
        placeholder="enter command or message..."
        spellcheck="false"
      />
    </div>
  </div>
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
      // TODO: logic to join or create a channel with optional privacy
      outputLines.value.push(`TODO: join channel logic: ${args.join(' ')}`)
      break
    case '/quit':
      // TODO: logic to delete the current channel (admin only)
      outputLines.value.push('TODO: delete channel logic')
      break
    case '/cancel':
      // TODO: logic to leave the current channel
      outputLines.value.push('TODO: leave channel logic')
      break
    case '/invite':
      if (args.length < 1) {
        outputLines.value.push('Usage: /invite <nickname>')
      } else {
        // TODO: logic to invite a user to the channel
        outputLines.value.push(`TODO: invite user logic for: ${args[0]}`)
      }
      break
    case '/revoke':
      if (args.length < 1) {
        outputLines.value.push('Usage: /revoke <nickname>')
      } else {
        // TODO: logic to revoke a user from the private channel
        outputLines.value.push(`TODO: revoke user logic for: ${args[0]}`)
      }
      break
    case '/kick':
      if (args.length < 1) {
        outputLines.value.push('Usage: /kick <nickname>')
      } else {
        // TODO: logic to kick a user from the channel
        outputLines.value.push(`TODO: kick user logic for: ${args[0]}`)
      }
      break
    case '/list':
      // TODO: logic to display channel members
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
  color: $text-inverse;
  font-family: monospace;
  border: 1px solid $border-light;
  display: flex;
  flex-direction: column;
}

.terminal-output {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background: $command-line-bg;
}

.output-line {
  margin: 3px 0;
  line-height: 1.3;
  font-size: 13px;
}

.command-line {
  display: flex;
  align-items: center;
  padding: 12px;
  border-top: 1px solid rgba($border-light, 0.5);
  background: $command-line-bg;
}

.prompt {
  margin-right: 8px;
  color: $positive;
  font-weight: bold;
  font-size: 14px;
}

.command-input {
  flex: 1;
  background: transparent;
  border: none;
  color: $text-inverse;
  font-family: inherit;
  outline: none;
  font-size: 14px;
  padding: 4px 0;
}

.command-input::placeholder {
  color: $text-muted;
}
</style>
