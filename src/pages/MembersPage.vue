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
          <q-item v-for="member in members" :key="member.id" clickable>
            <q-item-section avatar>
              <q-avatar>
                <img :src="member.avatar" alt="avatar" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ member.name }}</q-item-label>
              <q-item-label caption>
                <q-badge
                  :color="member.status === 'online' ? 'green' : 'grey'"
                  rounded
                  class="q-mr-sm"
                />
                {{ member.status }}
              </q-item-label>
            </q-item-section>

          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface Member {
  id: number
  name: string
  avatar: string
  status: 'online' | 'offline' | 'away'
}

const members = ref<Member[]>([
  {
    id: 1,
    name: 'John Doe',
    avatar: 'https://cdn.quasar.dev/img/avatar1.jpg',
    status: 'online'
  },
  {
    id: 2,
    name: 'Jane Smith',
    avatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
    status: 'away'
  },
  {
    id: 3,
    name: 'Alex Johnson',
    avatar: 'https://cdn.quasar.dev/img/avatar3.jpg',
    status: 'offline'
  }
])

const goBack = () => {
  router.push('/')
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

.card-header {
  background-color: $message-area-bg;
}

.text-secondary {
  color: $text-secondary;
}
</style>