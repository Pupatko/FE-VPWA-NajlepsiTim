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

          <q-item v-for="member in members" :key="member.nick_name">

            <!-- avatar -->
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white">
                {{ member.nick_name[0].toUpperCase() }}
              </q-avatar>
            </q-item-section>

            <!-- name + owner badge -->
            <q-item-section>
              <q-item-label>
                {{ member.nick_name }}

                <q-badge
                  v-if="member.owner"
                  color="purple"
                  class="q-ml-xs"
                >
                  owner
                </q-badge>
              </q-item-label>

              <q-item-label caption>
                <span v-if="member.kick_count >= 3" style="color: red">
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from 'src/boot/axios'

const router = useRouter()
const route = useRoute()

interface Member {
  nick_name: string
  owner: boolean
  kick_count: number
}

const members = ref<Member[]>([])

const goBack = () => {
  router.back()
}

async function loadMembers() {
  try {
    const channelId = Number(route.params.channelId)
    if (!channelId) return

    const { data } = await api.post('/ws/command', {
      channelId,
      content: '/list',
    })

    members.value = data.members || []

  } catch (err) {
    console.error('Load members failed:', err)
  }
}

onMounted(loadMembers)
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
