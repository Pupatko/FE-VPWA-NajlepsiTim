<template>
  <q-chat-message
    :name="!isCurrentUser ? message.author : null"
    :text="[message.content]"
    :stamp="formattedTimestamp"
    :sent="isCurrentUser"
    :text-color="isCurrentUser ? 'white' : 'dark'"
    :bg-color="isCurrentUser ? 'primary' : 'grey-3'"
  >
    <template v-slot:avatar v-if="!isCurrentUser">
      <q-avatar color="primary" text-color="white">
        {{ authorInitials }}
      </q-avatar>
    </template>
  </q-chat-message>
</template>

<script lang="ts">
import { computed } from 'vue'

export default {
  props: {
    message: {
      type: Object,
      required: true
    },
    currentUser: {
      type: String,
      default: 'me'
    }
  },
  setup(props) {
    // check if message is from current user
    const isCurrentUser = computed(() => {
      return props.message.author === props.currentUser
    })

    // get author initials for avatar
    const authorInitials = computed(() => {
      const author = props.message.author || ''
      return author.substring(0, 2).toUpperCase()
    })

    // format timestamp to readable format
    const formattedTimestamp = computed(() => {
      const date = new Date(props.message.timestamp)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    })

    return {
      isCurrentUser,
      authorInitials,
      formattedTimestamp
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
