<template>
  <q-page class="flex flex-center view-public-channels-page">
    <q-card class="public-channels-card" flat bordered>
    <q-card-section class="card-header">
        <div class="row items-center justify-between">
            <div>
                <div class="text-h5">Public Channels</div>
                <div class="text-subtitle2 text-secondary">
                    Browse all available public channels
                </div>
            </div>
            <q-btn flat color="grey" label="Back" @click="goBack" class="q-ml-md" />
        </div>
    </q-card-section>

      <q-separator />

      <q-card-section>
        <q-infinite-scroll @load="loadMoreChannels" :offset="10">
          <q-list bordered separator>
            <q-item
                v-for="channel in publicChannels"
                :key="channel.id"
                clickable
                @click="joinChannel(channel)"
            >
                <q-item-section avatar>
                <q-icon name="tag" color="primary" />
                </q-item-section>
                <q-item-section>
                <q-item-label>{{ channel.name }}</q-item-label>
                <q-item-label caption>
                    {{'Public channel' }}
                </q-item-label>
                </q-item-section>
            </q-item>
          </q-list>
        </q-infinite-scroll>
      </q-card-section>

      <q-separator />


    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

interface Channel {
  id: number
  name: string
  icon: string
  isAdmin: boolean
  isPrivate: boolean
  description?: string
}

const publicChannels = ref<Channel[]>([
  { id: 1, name: '# general', icon: 'tag', isAdmin: true, isPrivate: false },
  { id: 2, name: '# random', icon: 'tag', isAdmin: false, isPrivate: false },
  { id: 3, name: '# dev', icon: 'tag', isAdmin: true, isPrivate: false },
  { id: 4, name: '# another public channel', icon: 'tag', isAdmin: false, isPrivate: false },
  { id: 5, name: '# design', icon: 'tag', isAdmin: false, isPrivate: false },
  { id: 6, name: '# test kanal', icon: 'tag', isAdmin: false, isPrivate: false },
  { id: 7, name: '# public channel 1', icon: 'tag', isAdmin: false, isPrivate: false },
  { id: 8, name: '# public channel 2', icon: 'tag', isAdmin: false, isPrivate: false },
  { id: 9, name: '# public channel 3', icon: 'tag', isAdmin: false, isPrivate: false },
  { id: 10, name: '# public channel 4', icon: 'tag', isAdmin: false, isPrivate: false }
])

const loadMoreChannels = (index: number, done: (stop?: boolean) => void) => {
  setTimeout(() => {
    
    const newChannels: Channel[] = []
    //temporary - potom pojdu existujuce z DB
    for (let i = 0; i < 5; i++) {
      const id = publicChannels.value.length + 1
      newChannels.push({
        id,
        name: `# public channel ${id}`,
        icon: 'tag',
        isAdmin: false,
        isPrivate: false
      })
    }

    publicChannels.value.push(...newChannels)

    if (publicChannels.value.length >= 30) {
      done(true)
    } else {
      done()
    }
  }, 1000)
}

const joinChannel = (channel: Channel) => {
  $q.notify({
    message: `Joined ${channel.name}`,
    type: 'positive',
    icon: 'check_circle'
  })
  router.push('/')
}

const goBack = () => {
  router.push('/')
}

</script>

<style lang="scss" scoped>
.view-public-channels-page {
  background-color: $chat-bg;
  min-height: 100vh;
  padding: 20px;
}

.public-channels-card {
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
