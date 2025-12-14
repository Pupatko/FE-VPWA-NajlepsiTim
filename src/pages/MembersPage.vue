<template>
  <q-page class="members-page flex flex-center">
    <q-card class="members-card" flat bordered>

      <!-- Header -->
      <q-card-section class="card-header row items-center justify-between">
        <div>
          <div class="text-h5">Channel Members</div>
          <div class="text-subtitle2 text-secondary">
            List of users currently in this channel
          </div>
        </div>

        <q-btn flat color="grey" label="Back" @click="goBack" />
      </q-card-section>

      <q-separator />

      <!-- Members list -->
      <q-card-section>
        <q-list bordered separator>

          <q-item v-for="member in members" :key="member.id">

            <!-- avatar -->
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white">
                {{ member.nickName[0]?.toUpperCase() }}
              </q-avatar>
            </q-item-section>

            <!-- name + owner badge -->
            <q-item-section>
              <q-item-label class="row items-center no-wrap q-gutter-xs">
                <q-icon name="circle" :color="statusColor(member.status)" size="10px" />
                <span>{{ member.nickName }}</span>

                <q-badge
                  v-if="member.isOwner"
                  color="purple"
                  class="q-ml-xs"
                >
                  owner
                </q-badge>
              </q-item-label>

              <q-item-label caption>
                <span class="text-grey-6 q-mr-sm">Status: {{ member.status }}</span>
                <span v-if="member.kick_count && member.kick_count >= 3" style="color: red">
                  banned
                </span>
                <span v-else>
                  member
                </span>
              </q-item-label>
            </q-item-section>

          </q-item>

        </q-list>
      </q-card-section>

    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { api } from 'src/boot/axios'

const router = useRouter()
const route = useRoute()
const store = useStore()

interface Member {
  id: number
  nickName: string
  isOwner: boolean
  kick_count?: number
  status: 'online' | 'dnd' | 'offline'
}

const members = ref<Member[]>([])
let systemHandler: ((payload: any) => void) | null = null

const goBack = () => {
  router.back()
}

async function loadMembers() {
  try {
    const channelId = Number(route.params.channelId)
    if (!channelId) return

    const { data } = await api.get(`/channels/${channelId}/members`)
    members.value = data.members || []
    members.value.forEach((m) => {
      store.dispatch('presence/setStatus', { userId: m.id, status: m.status })
    })

  } catch (err) {
    console.error('Load members failed:', err)
  }
}

onMounted(loadMembers)
onMounted(() => {
  const channelId = Number(route.params.channelId)
  const socket = (window as any).$socket as any

  if (!socket || typeof socket.on !== 'function' || !channelId) return

  systemHandler = (payload: any) => {
    const targetChannel =
      payload?.channelId || payload?.channel_id // normalize snake / camel
    if (!targetChannel || Number(targetChannel) !== channelId) return

    switch (payload?.type) {
      case 'join':
      case 'kick':
      case 'revoke':
      case 'user_left':
      case 'channel_closed':
      case 'channel_deleted':
      case 'channel_revoked':
      case 'channel_kicked':
      case 'channel_user_left':
        void loadMembers()
        break
      default:
        break
    }
  }

  socket.on('system', systemHandler)
})

onBeforeUnmount(() => {
  const socket = (window as any).$socket as any
  if (socket && systemHandler) {
    socket.off('system', systemHandler)
  }
})

const statusColor = (status: 'online' | 'dnd' | 'offline') => {
  if (status === 'dnd') return 'dnd-status'
  if (status === 'offline') return 'grey-6'
  return 'positive'
}

</script>

<style scoped lang="scss">
.members-page {
  background-color: $chat-bg;
  min-height: 100vh;
  padding: 20px;
}

.members-card {
  width: 100%;
  max-width: 600px;
  background-color: $message-area-bg;
  border-radius: $border-radius;
  box-shadow: $shadow-medium;
}

.text-secondary {
  color: $text-secondary;
}
</style>
