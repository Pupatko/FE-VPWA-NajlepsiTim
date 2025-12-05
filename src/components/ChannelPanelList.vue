<template>
  <q-list class="channel-list q-pt-sm q-pb-lg">
    <div v-if="loading" class="q-pa-md text-center">
      <q-spinner color="primary" size="40px" />
      <div class="q-mt-sm text-grey-6">Loading channels...</div>
    </div>

    <template v-else>
      <!-- Invitations -->
      <div v-if="invitedChannels.length" class="q-px-md q-mb-sm text-grey-5 text-caption">
        Pozvánky
      </div>
      <q-item
        v-for="inv in invitedChannels"
        :key="`invite-${inv.id}`"
        class="q-px-md invite-item"
      >
        <q-item-section avatar>
          <q-icon name="mail" color="orange" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-white">#{{ inv.name }}</q-item-label>
          <q-item-label caption class="text-grey-5">
            Pozvánka{{ inv.inviterNickName ? ` • od ${inv.inviterNickName}` : '' }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn dense flat round icon="close" color="negative" @click="declineInvite(inv)">
            <q-tooltip>Odmietnuť</q-tooltip>
          </q-btn>
          <q-btn dense flat round icon="check" color="positive" @click="acceptInvite(inv)">
            <q-tooltip>Prijať</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>

      <!-- Empty state -->
      <div v-if="!filteredChannels.length && !invitedChannels.length" class="q-pa-md text-center">
        <q-icon name="chat_bubble_outline" size="48px" color="grey-6" />
        <div class="q-mt-sm text-grey-6">No channels found</div>
        <q-btn flat color="primary" label="Create Channel" class="q-mt-md" @click="goCreateChannel" />
      </div>

      <!-- Channels -->
      <q-item
        v-for="channel in filteredChannels"
        :key="channel.id"
        clickable
        v-ripple
        :active="activeChannelId === channel.id"
        active-class="active-channel"
        @click="selectChannel(channel.id)"
        class="q-px-md"
      >
        <q-item-section avatar>
          <q-icon :name="channel.private ? 'lock' : 'tag'" :color="channel.private ? 'amber' : 'blue-4'" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-white">#{{ channel.name }}</q-item-label>
          <q-item-label caption class="text-grey-5">
            {{ channel.isOwner ? 'Owner' : 'Member' }}
          </q-item-label>
        </q-item-section>

        <q-item-section side v-if="channel.isOwner">
          <q-badge color="amber" text-color="black">Owner</q-badge>
        </q-item-section>
      </q-item>
    </template>
  </q-list>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import store from 'src/store'
import type { Channel } from 'src/store/modules/channels'

interface Props {
  activeType?: 'public' | 'private'
}
const props = defineProps<Props>()

const router = useRouter()
const route = useRoute()

const loading = ref(false)

// reactive channels from store
const channels = computed(() => store.state.channels.list as Channel[])

const activeChannelId = computed(() => route.params.channelId ? Number(route.params.channelId) : null)

const invitedChannels = computed(() => channels.value.filter(c => c.invited))

const filteredChannels = computed(() => {
  const type = props.activeType ?? 'public'
  return channels.value.filter(c => !c.invited && (type === 'private' ? c.private : !c.private))
})

const selectChannel = (channelId: number) => router.push(`/channels/${channelId}`)
const goCreateChannel = () => router.push('/create-channel')

const acceptInvite = async (channel: Channel) => {
  try {
    const socket = (window as any).$socket as any
    if (socket && socket.connected) {
      socket.emit(
        'command:join',
        { channelName: channel.name, private: channel.private },
        (response: any) => {
          if (!response?.ok) {
            console.error('Invite accept failed', response?.error)
            return
          }
        }
      )
    }
    // remove invited flag and add channel normally
    store.commit('channels/ADD_CHANNEL', { ...channel, invited: false })
    router.push(`/channels/${channel.id}`)
  } catch (err) {
    console.error(err)
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
    store.commit('channels/REMOVE_CHANNEL', channel.id)
  }
}

// load channels on mount
const loadChannels = async () => {
  loading.value = true
  await store.dispatch('channels/fetchMyChannels')
  loading.value = false
}

onMounted(loadChannels)

// Socket listenery sú CENTRÁLNE v boot/socket.ts
// Nepotrebujeme ich tu duplikovať
</script>

<style scoped lang="scss">
.channel-list {
  background-color: $sidebar-bg;
  color: $text-inverse;
  overflow-y: auto;
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
</style>
