<template>
  <q-chat-message
    :name="!isCurrentUser ? message.author : null"
    :text="[message.content]"
    :stamp="formattedTimestamp"
    :sent="isCurrentUser"
    :text-color="isCurrentUser ? 'white' : 'dark'"
    :bg-color="isCurrentUser ? 'primary' : (isMentionForMe ? 'message-highlight' : 'grey-3')"
    :class="{ 'mention-highlight': isMentionForMe && !isCurrentUser }"
    :data-mention="mentionLabel"
  >
    <template v-slot:avatar v-if="!isCurrentUser">
      <q-avatar color="primary" text-color="white" class="avatar-wrapper">
        {{ authorInitials }}
        <span
          :class="['status-dot', status]"
        ></span>
      </q-avatar>
    </template>
  </q-chat-message>
</template>

<script lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  props: {
    message: {
      type: Object,
      required: true
    },
    currentUser: {
      type: String,
      default: 'me'
    },
    currentUserId: {
      type: Number,
      default: null
    },
    userId: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const store = useStore()

    const isCurrentUser = computed(() => props.message.author === props.currentUser)

    const isMentionForMe = computed(() => {
      const targetId = props.message.mentionedUserId
      if (targetId && props.currentUserId && targetId === props.currentUserId) return true

      const mentionName = props.message.mentionedUser
      if (mentionName && props.currentUser) {
        return mentionName.toLowerCase() === props.currentUser.toLowerCase()
      }

      if (props.currentUser) {
        return (props.message.content || '').toLowerCase().includes(`@${props.currentUser.toLowerCase()}`)
      }
      return false
    })

    const mentionLabel = computed(() => {
      if (props.message.mentionedUser) return `@${props.message.mentionedUser}`
      if (props.currentUser) return `@${props.currentUser}`
      return '@you'
    })

    const authorInitials = computed(() => {
      const author = props.message.author || ''
      return author.substring(0, 2).toUpperCase()
    })

    const formattedTimestamp = computed(() => {
      const date = new Date(props.message.timestamp)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    })

    const status = computed(() => {
      const getter = store.getters['presence/statusFor']
      const val = typeof getter === 'function' ? getter(props.userId || props.message.userId) : undefined
      if (val === 'dnd') return 'dnd'
      if (val === 'online') return 'online'
      return 'offline'
    })

    return {
      isCurrentUser,
      isMentionForMe,
      mentionLabel,
      authorInitials,
      formattedTimestamp,
      status
    }
  }
}
</script>

<style scoped lang="scss">
.avatar-wrapper {
  position: relative;
}

.status-dot {
  position: absolute;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  bottom: 0;
  right: 0;
  border: 2px solid white;
}

.status-dot.online {
  background-color: $online-status;
}

.status-dot.dnd {
  background-color: $dnd-status;
}

.status-dot.offline {
  background-color: $offline-status;
}

.mention-highlight {
  .q-message-container {
    position: relative;
    background: #fdf2f8 !important; // soft pink highlight
    border: 1px solid #f9a8d4;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  .q-message-container::before {
    content: attr(data-mention);
    position: absolute;
    top: -10px;
    right: -6px;
    background: #db2777;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
    pointer-events: none;
  }
}
</style>
