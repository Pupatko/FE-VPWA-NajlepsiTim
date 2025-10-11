<template>
  <q-item clickable v-ripple @click="selectChannel" class="channel-item">
    <q-item-section avatar>
      <q-icon :name="icon" color="grey-4" />
    </q-item-section>
    <q-item-section>{{ name }}</q-item-section>
    
    <!-- Action buttons -->
    <q-item-section side class="action-buttons">
      <!-- Leave channel - always visible -->
      <q-btn 
        flat 
        dense 
        round 
        icon="exit_to_app" 
        size="sm" 
        color="warning"
        @click.stop="leaveChannel"
      >
        <q-tooltip>Leave Channel</q-tooltip>
      </q-btn>
      
      <!-- Delete channel - only for admins -->
      <q-btn 
        v-if="isAdmin"
        flat 
        dense 
        round 
        icon="delete" 
        size="sm" 
        color="negative"
        @click.stop="deleteChannel"
      >
        <q-tooltip>Delete Channel</q-tooltip>
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

const props = defineProps({
  name: String,
  channelId: [String, Number],
  icon: {
    type: String,
    default: 'tag'
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const selectChannel = () => {
  router.push('/channel')
  console.log('Selected channel:', props.name)
}

const leaveChannel = () => {
  $q.dialog({
    title: 'Leave Channel',
    message: `Are you sure you want to leave ${props.name}?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    // TODO: Call backend API to leave channel
    console.log('Leaving channel:', props.name)
    $q.notify({
      type: 'info',
      message: `Left channel ${props.name}`,
      icon: 'exit_to_app'
    })
  })
}

const deleteChannel = () => {
  $q.dialog({
    title: 'Delete Channel',
    message: `Are you sure you want to permanently delete ${props.name}? This action cannot be undone.`,
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk(() => {
    // TODO: Call backend API to delete channel
    console.log('Deleting channel:', props.name)
    $q.notify({
      type: 'negative',
      message: `Channel ${props.name} deleted`,
      icon: 'delete'
    })
  })
}
</script>

<style lang="scss" scoped>
.channel-item {
  color: $text-inverse;
  
  &:hover {
    background-color: $channel-hover;
    color: $text-primary;
    
    .action-buttons {
      opacity: 1;
    }
  }
  
  &.q-item--active {
    background-color: $channel-active;
    color: $primary;
    font-weight: 600;
  }
}

.action-buttons {
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  gap: 4px;
}
</style>
