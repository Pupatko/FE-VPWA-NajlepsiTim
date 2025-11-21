<template>
  <q-scroll-area class="fit channel-list-area">
    <q-list>
      <ChannelPanelItem class="q-sm"
        v-for="ch in filteredChannels"
        :key="ch.id"
        :channel-id="ch.id"
        :name="ch.name"
        :icon="ch.icon"
        :is-admin="ch.isAdmin"      
      />
    </q-list>
  </q-scroll-area>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import ChannelPanelItem from './ChannelPanelItem.vue'
import api from 'src/api/axios'

interface Channel {
  id: number
  name: string
  icon: string
  isAdmin: boolean
  isPrivate: boolean
}

const myChannels = ref<Channel[]>([])

onMounted(async () => {
  try {
    const { data } = await api.get('/my-channels')

    myChannels.value = data.map((ch: any) => ({
      id: ch.id,
      name: ch.name,
      icon: 'tag',
      isAdmin: ch.isAdmin,
      isPrivate: ch.isPrivate,
    }))
  } catch (err) {
    
    // Fallback na lokalne demo kanaly ak user nie je prohlaseny
    console.warn('Failed to load channels from /api/my-channels, using demo list', err)
    myChannels.value = [
      { id: 1, name: '# generic channel', icon: 'tag', isAdmin: true, isPrivate: false },
      { id: 2, name: '# generic channel', icon: 'tag', isAdmin: false, isPrivate: false },
      { id: 3, name: '# generic channel', icon: 'tag', isAdmin: true, isPrivate: false },
      { id: 4, name: '# generic channel', icon: 'tag', isAdmin: false, isPrivate: false },
      { id: 5, name: '# generic channel', icon: 'tag', isAdmin: false, isPrivate: true }
    ]
  }
})


const props = defineProps<{
  showPublicAll: boolean
  activeType: 'public' | 'private'
}>()

const filteredChannels = computed(() => {
  return myChannels.value.filter(ch => props.activeType === 'public' ? !ch.isPrivate : ch.isPrivate)
})
</script>

<style lang="scss" scoped>
.channel-list-area {
  background-color: $sidebar-bg;
  color: $text-inverse;
  height: 100%;
  padding: 8px;
  
  .q-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
}
</style>
