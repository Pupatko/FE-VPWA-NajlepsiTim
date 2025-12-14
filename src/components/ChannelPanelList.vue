<template>
  <q-list class="channel-list q-pt-sm q-pb-lg">
    <div v-if="loading" class="q-pa-md text-center">
      <q-spinner color="primary" size="40px" />
      <div class="q-mt-sm text-grey-6">Loading channels...</div>
    </div>

    <template v-else>
      <!-- Invitations -->
      <div v-if="invitedChannels.length" class="q-px-md q-mb-xs text-grey-5 text-caption">
        Invitations
      </div>
      <div v-if="invitedChannels.length" class="q-gutter-y-sm q-px-sm">
        <q-item
          v-for="inv in invitedChannels"
          :key="`invite-${inv.id}`"
          class="q-px-md invite-item"
        >
          <q-item-section avatar>
            <q-icon name="mail" color="orange" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-white ellipsis">#{{ inv.name }}</q-item-label>
            <q-item-label caption class="text-grey-5">
              Invitation{{ inv.inviterNickName ? ` • from ${inv.inviterNickName}` : '' }}
            </q-item-label>
          </q-item-section>
          <q-item-section side class="invite-actions">
            <q-btn dense flat round icon="close" color="negative" @click="declineInvite(inv)">
              <q-tooltip>Decline</q-tooltip>
            </q-btn>
            <q-btn dense flat round icon="check" color="positive" @click="acceptInvite(inv)">
              <q-tooltip>Accept</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </div>

      <!-- Empty state -->
      <div v-if="!filteredChannels.length && !invitedChannels.length" class="q-pa-md text-center">
        <q-icon name="chat_bubble_outline" size="48px" color="grey-6" />
        <div class="q-mt-sm text-grey-6">No channels found</div>
        <q-btn flat color="primary" label="Create Channel" class="q-mt-md" @click="goCreateChannel" />
      </div>

      <!-- Channels -->
      <q-virtual-scroll
        :items="filteredChannels"
        :virtual-scroll-item-size="68"
        style="max-height: calc(100vh - 260px);"
      >
        <template #default="{ item: channel }">
          <q-item
            :key="channel.id"
            clickable
            v-ripple
            :active="activeChannelId === channel.id"
            active-class="active-channel"
            @click="selectChannel(channel)"
            class="q-px-md channel-row"
          >
            <q-item-section avatar>
              <q-icon :name="channel.private ? 'lock' : 'tag'" :color="channel.private ? 'amber' : 'blue-4'" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-white ellipsis">#{{ channel.name }}</q-item-label>
              <q-item-label caption class="text-grey-5">
                {{ channel.isOwner ? 'Owner' : 'Member' }}
              </q-item-label>
            </q-item-section>

            <q-item-section side v-if="activeChannelId === channel.id" class="channel-actions">
              <q-btn dense flat round icon="logout" color="warning" @click.stop="leaveChannel(channel)">
                <q-tooltip>Leave channel</q-tooltip>
              </q-btn>
              <q-btn
                v-if="channel.isOwner"
                dense
                flat
                round
                icon="delete"
                color="negative"
                @click.stop="deleteChannel(channel)"
              >
                <q-tooltip>Delete channel</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
        </template>
      </q-virtual-scroll>
    </template>
  </q-list>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import store from 'src/store'
import type { Channel } from 'src/store/modules/channels'
import { api } from 'src/boot/axios'

interface Props {
  activeType?: 'public' | 'private'
}
const props = defineProps<Props>()

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const loading = ref(false)

// reactive channels from store
const channels = computed(() => store.state.channels.list as Channel[])

const activeChannelId = computed(() => route.params.channelId ? Number(route.params.channelId) : null)

const invitedChannels = computed(() => store.state.channels.pendingInvites as Channel[])

const filteredChannels = computed(() => {
  const type = props.activeType ?? 'public'
  return channels.value.filter(c => !c.invited && (type === 'private' ? c.private : !c.private))
})

const selectChannel = (channel: Channel) => {
  router.push(`/channels/${channel.id}`)
}
const goCreateChannel = () => router.push('/create-channel')

const acceptInvite = async (channel: Channel) => {
  try {
    const socket = (window as any).$socket as any
    if (!socket || !socket.connected) {
      throw new Error('Socket is not connected')
    }

    await new Promise((resolve, reject) => {
      socket.emit(
        'command:join',
        { channelName: channel.name, private: channel.private },
        (response: any) => {
          if (!response?.ok) {
            reject(new Error(response?.error || 'Invite accept failed'))
            return
          }
          resolve(response)
        }
      )
    })

    store.dispatch('channels/acceptInvite', channel)
    router.push(`/channels/${channel.id}`)
  } catch (err) {
    console.error(err)
    $q.notify({
      type: 'negative',
      message: (err as any)?.message || 'Failed to accept invite',
    })
  }
}

const declineInvite = async (channel: Channel) => {
  try {
    const socket = (window as any).$socket as any
    if (socket && socket.connected) {
      socket.emit(
        'command:cancel',
        { channelId: channel.id },
        () => {}
      )
    }
  } catch (err) {
    console.error(err)
  } finally {
    store.dispatch('channels/declineInvite', channel.id)
  }
}

const leaveChannel = async (channel: Channel) => {
  try {
    const socket = (window as any).$socket as any
    if (!socket || !socket.connected) {
      throw new Error('Socket is not connected')
    }

    await new Promise((resolve, reject) => {
      socket.emit(
        'command:cancel',
        { channelId: channel.id },
        (response: any) => {
          if (!response?.ok) {
            reject(new Error(response?.error || 'Leave failed'))
            return
          }
          resolve(response?.result)
        }
      )
    })

    store.commit('channels/REMOVE_CHANNEL', channel.id)
    // if user is currently in this channel, redirect home
    if (activeChannelId.value === channel.id) {
      router.push('/')
    }
  } catch (err) {
    console.error(err)
  }
}

const deleteChannel = async (channel: Channel) => {
  try {
    const socket = (window as any).$socket as any
    if (!socket || !socket.connected) {
      throw new Error('Socket is not connected')
    }

    await new Promise((resolve, reject) => {
      socket.emit(
        'command:quit',
        { channelId: channel.id },
        (response: any) => {
          if (!response?.ok) {
            reject(new Error(response?.error || 'Delete failed'))
            return
          }
          resolve(response?.result)
        }
      )
    })

    store.commit('channels/REMOVE_CHANNEL', channel.id)
    router.push('/')
  } catch (err) {
    console.error(err)
  }
}

// load channels on mount
const loadChannels = async () => {
  loading.value = true
  await store.dispatch('channels/fetchMyChannels')
  loading.value = false
}

onMounted(loadChannels)

// Socket listeners are centralized in boot/socket.ts
</script>

<style scoped lang="scss">
.channel-list {
  background-color: $sidebar-bg;
  color: $text-inverse;
  overflow-y: hidden;
  padding-bottom: 8px;
}

.q-item {
  border-left: 3px solid transparent;
  transition: all 0.2s;
  border-radius: $border-radius;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    border-left-color: $primary;
  }

  &.active-channel {
    background-color: $primary;
    border-left-color: $accent;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }
}

.channel-row {
  position: relative;
}

.invite-item {
  background-color: rgba(255, 255, 255, 0.06);
  border-radius: $border-radius;
  margin: 0 12px 6px;
  padding: 4px 0;
  flex-wrap: nowrap;
}

.invite-item.q-item {
  display: flex;
  flex-wrap: nowrap !important;
}

.invite-item .q-item__section--avatar {
  min-width: 42px;
  flex: 0 0 auto;
}

.invite-item .q-item__label {
  word-break: break-word;
}

.invite-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* override global row flex wrapping inside invitation items */
:deep(.invite-item.row) {
  flex-wrap: nowrap !important;
}

:deep(.invite-item.column) {
  flex-wrap: nowrap !important;
}

:deep(.invite-item.flex) {
  flex-wrap: nowrap !important;
}

:deep(.invite-item .q-item__section) {
  align-items: center;
  flex-wrap: nowrap;
  flex: 0 1 auto;
}
</style>
