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
          <div v-if="loading" class="q-pa-md text-center">
            <q-spinner color="primary" size="40px" />
            <div class="q-mt-sm text-grey-6">Loading channels...</div>
          </div>

          <q-list v-else bordered separator>
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
                <q-item-label># {{ channel.name }}</q-item-label>
                <q-item-label caption>
                  Public channel
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      <q-separator />


    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import channelService, { Channel } from 'src/services/channel.service'

const router = useRouter()
const $q = useQuasar()

const publicChannels = ref<Channel[]>([])
const loading = ref(false)

const loadPublicChannels = async () => {
  try {
    loading.value = true
    publicChannels.value = await channelService.getPublicChannels()
  } catch (error) {
    console.error('Failed to load public channels', error)
    $q.notify({
      type: 'negative',
      message: 'Nepodarilo sa načítať verejné kanály',
    })
  } finally {
    loading.value = false
  }
}

onMounted(loadPublicChannels)

const joinChannel = async (channel: Channel) => {
  try {
    const { channelId, message } = await channelService.joinChannel({
      name: channel.name,
      private: false,
    })

    $q.notify({
      message: message || `Joined ${channel.name}`,
      type: 'positive',
      icon: 'check_circle',
    })

    // presmeruj priamo do chatu daného kanála
    router.push(`/channels/${channelId}`)
  } catch (error: any) {
    console.error('Failed to join channel', error)
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || 'Nepodarilo sa pripojiť do kanála',
    })
  }
}

const goBack = () => {
  router.back()
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
