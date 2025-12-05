<template>
  <q-item clickable v-ripple @click="onClick" class="channel-item" :active="isActive">
    <q-item-section avatar>
      <q-icon :name="icon" color="grey-4" />
    </q-item-section>
    <q-item-section>
      <div class="row items-center no-wrap justify-between">
        <span>{{ name }}</span>
        <q-icon v-if="isActive" name="expand_more" size="16px" class="hint-icon" />
      </div>
    </q-item-section>

    <q-menu ref="menuRef" touch-position anchor="bottom right" self="top right">
      <q-list dense style="min-width: 160px">
        <q-item clickable v-close-popup @click="leaveChannel">
          <q-item-section avatar>
            <q-icon name="logout" color="warning" />
          </q-item-section>
          <q-item-section>Leave</q-item-section>
        </q-item>
        <q-item v-if="isAdmin" clickable v-close-popup @click="deleteChannel">
          <q-item-section avatar>
            <q-icon name="delete" color="negative" />
          </q-item-section>
          <q-item-section>Delete (owner)</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-item>
</template>

<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { inject, ref, computed } from 'vue'
import { api } from 'src/boot/axios'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

// inject the reactive channel list
const myChannels = inject('myChannels') as any

const props = defineProps({
  name: String,
  channelId: [String, Number],
  icon: { type: String, default: 'tag' },
  isAdmin: { type: Boolean, default: false }
})

const menuRef = ref()
const isActive = computed(() => Number(route.params.channelId) === Number(props.channelId))

const onClick = () => {
  if (isActive.value && menuRef.value) {
    menuRef.value.show()
  } else {
    router.push(`/channels/${props.channelId}`)
  }
}

// --------------------- LEAVE CHANNEL (socket) ---------------------
const leaveChannel = () => {
  $q.dialog({
    title: 'Leave Channel',
    message: `Are you sure you want to leave ${props.name}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const socket = (window as any).$socket as any
      if (!socket || !socket.connected) {
        throw new Error('Socket is not connected')
      }

      await new Promise((resolve, reject) => {
        socket.emit(
          'command:cancel',
          { channelId: props.channelId },
          (response: any) => {
            if (!response?.ok) {
              reject(new Error(response?.error || 'Leave failed'))
              return
            }
            resolve(response?.result)
          }
        )
      })

      if (myChannels?.value) {
        myChannels.value = myChannels.value.filter(
          (ch: any) => ch.id !== props.channelId
        )
      }

      $q.notify({
        type: 'info',
        message: `Left channel ${props.name}`,
        icon: 'exit_to_app'
      })
      if (Number(route.params.channelId) === Number(props.channelId)) {
        router.push('/')
      }
    } catch (err) {
      console.error(err)
      $q.notify({ type: 'negative', message: 'Failed to leave channel', icon: 'error' })
    }
  })
}

// --------------------- DELETE CHANNEL ---------------------
const deleteChannel = () => {
  if (!props.isAdmin) return

  $q.dialog({
    title: 'Delete Channel',
    message: `Delete ${props.name}? This action cannot be undone.`,
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk(async () => {
    try {
      const socket = (window as any).$socket as any
      if (!socket || !socket.connected) {
        throw new Error('Socket is not connected')
      }

      await new Promise((resolve, reject) => {
        socket.emit(
          'command:quit',
          { channelId: props.channelId },
          (response: any) => {
            if (!response?.ok) {
              reject(new Error(response?.error || 'Delete failed'))
              return
            }
            resolve(response?.result)
          }
        )
      })

      if (myChannels?.value) {
        myChannels.value = myChannels.value.filter(
          (ch: any) => ch.id !== props.channelId
        )
      }

      $q.notify({
        type: 'negative',
        message: `Channel ${props.name} deleted`,
        icon: 'delete'
      })

      router.push('/')
    } catch (err: any) {
      console.error(err)
      $q.notify({ type: 'negative', message: err?.message || 'Failed to delete channel', icon: 'error' })
    }
  })
}
</script>

<style lang="scss" scoped>
.channel-item {
  color: $text-inverse;
  background-color: $sidebar-item-bg;
  border-radius: 16px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  padding-right: 8px;

  &:hover {
    background-color: $channel-hover;
    color: $text-primary;
  }

  &.q-item--active {
    background-color: $channel-active;
    color: $primary;
    font-weight: 600;
  }
}

.hint-icon {
  opacity: 0.6;
  margin-left: 8px;
}
</style>
