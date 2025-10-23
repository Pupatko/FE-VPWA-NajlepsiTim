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
import { ref, computed } from 'vue'
import ChannelPanelItem from './ChannelPanelItem.vue'

interface Channel {
  id: number
  name: string
  icon: string
  isAdmin: boolean
  isPrivate: boolean
}

const myChannels = ref<Channel[]>([
  { id: 1, name: '# general', icon: 'tag', isAdmin: true, isPrivate: false },
  { id: 2, name: '# random', icon: 'tag', isAdmin: false, isPrivate: false },
  { id: 3, name: '# dev', icon: 'tag', isAdmin: true, isPrivate: false },
  { id: 4, name: '# design', icon: 'tag', isAdmin: false, isPrivate: false },
  { id: 5, name: '# test kanal', icon: 'tag', isAdmin: false, isPrivate: true }
])


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
