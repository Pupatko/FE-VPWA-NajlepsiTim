<template>
  <q-list class="channel-list">
    <!-- Loading state -->
    <div v-if="loading" class="q-pa-md text-center">
      <q-spinner color="primary" size="40px" />
      <div class="q-mt-sm text-grey-6">Loading channels...</div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!loading && filteredChannels.length === 0" class="q-pa-md text-center">
      <q-icon name="chat_bubble_outline" size="48px" color="grey-6" />
      <div class="q-mt-sm text-grey-6">No channels found</div>
      <q-btn
        flat
        color="primary"
        label="Create Channel"
        class="q-mt-md"
        @click="$router.push('/create-channel')"
      />
    </div>

    <!-- Channels list -->
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
        <q-icon
          :name="channel.private ? 'lock' : 'tag'"
          :color="channel.private ? 'amber' : 'blue-4'"
        />
      </q-item-section>

      <q-item-section>
        <q-item-label class="text-white">#{{ channel.name }}</q-item-label>
        <q-item-label caption class="text-grey-5">
          {{ channel.isOwner ? 'Owner' : 'Member' }}
        </q-item-label>
      </q-item-section>

      <q-item-section side v-if="channel.isOwner">
        <q-badge color="amber" text-color="black">
          Owner
        </q-badge>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import channelService from 'src/services/channel.service'

interface Props {
  showPublicAll?: boolean
  activeType?: 'public' | 'private'
}

const props = withDefaults(defineProps<Props>(), {
  showPublicAll: false,
  activeType: 'public'
})

const channels = ref<any[]>([])
const loading = ref(false)
const router = useRouter()
const route = useRoute()
const $q = useQuasar()

// Active channel from route
const activeChannelId = computed(() => {
  return route.params.channelId ? Number(route.params.channelId) : null
})

// Filter channels based on type
const filteredChannels = computed(() => {
  if (props.activeType === 'private') {
    return channels.value.filter(c => c.private === true)
  } else {
    return channels.value.filter(c => c.private === false)
  }
})

// Load channels
const loadChannels = async () => {
  loading.value = true
  try {
    channels.value = await channelService.getMyChannels()
    console.log('✅ Channels loaded:', channels.value)
  } catch (error: any) {
    console.error('❌ Failed to load channels:', error)
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || 'Failed to load channels'
    })
    
    // Fallback demo data (optional)
    channels.value = []
  } finally {
    loading.value = false
  }
}

// Select channel
const selectChannel = (channelId: number) => {
  router.push(`/channels/${channelId}`)
}

// Watch for type changes to reload if needed
watch(() => props.activeType, () => {
  console.log('Type changed to:', props.activeType)
})

// Load on mount
onMounted(() => {
  loadChannels()
})

// Expose reload method for parent components
defineExpose({
  reload: loadChannels
})
</script>

<style lang="scss" scoped>
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
