<template>
  <q-list class="channel-list">
    <div v-if="loading" class="q-pa-md text-center">
      <q-spinner color="primary" size="40px" />
      <div class="q-mt-sm text-grey-6">Loading channels...</div>
    </div>

    <div v-else-if="!loading && filteredChannels.length === 0" class="q-pa-md text-center">
      <q-icon name="chat_bubble_outline" size="48px" color="grey-6" />
      <div class="q-mt-sm text-grey-6">No channels found</div>
      <q-btn flat color="primary" label="Create Channel" class="q-mt-md" @click="goCreateChannel" />
    </div>

    <q-item
      v-for="channel in filteredChannels"
      :key="channel.id"
      clickable
      v-ripple
      :active="activeChannelId === channel.id"
      active-class="bg-blue-9"
      @click="selectChannel(channel.id)"
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

const filteredChannels = computed(() => {
  const type = props.activeType ?? 'public'
  return channels.value.filter(c => type === 'private' ? c.private : !c.private)
})

const selectChannel = (channelId: number) => router.push(`/channels/${channelId}`)
const goCreateChannel = () => router.push('/create-channel')

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

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    border-left-color: $primary;
  }

  &.bg-blue-9 {
    background-color: $primary;
    border-left-color: $accent;
  }
}
</style>