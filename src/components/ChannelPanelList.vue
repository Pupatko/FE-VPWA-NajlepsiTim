<template>
  <q-scroll-area class="fit channel-list-area">
    <q-list>
      <ChannelPanelItem
        v-for="ch in channels"
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

// 🔹 typ pre kanál
interface Channel {
  id: number
  name: string
  icon: string
  isAdmin: boolean
}

// 🔹 tvoje dáta
const myChannels = ref<Channel[]>([
  { id: 1, name: '# general', icon: 'tag', isAdmin: true },
  { id: 2, name: '# random', icon: 'tag', isAdmin: false },
  { id: 3, name: '# dev', icon: 'tag', isAdmin: true },
  { id: 4, name: '# design', icon: 'tag', isAdmin: false },
  { id: 5, name: '# test kanal', icon: 'tag', isAdmin: false }
])

const publicChannels: Channel[] = [
  { id: 1, name: '# general', icon: 'tag', isAdmin: true },
  { id: 2, name: '# random', icon: 'tag', isAdmin: false },
  { id: 3, name: '# dev', icon: 'tag', isAdmin: true },
  { id: 4, name: '# another public channel', icon: 'tag', isAdmin: false },
  { id: 5, name: '# design', icon: 'tag', isAdmin: false },
  { id: 6, name: '# test kanal', icon: 'tag', isAdmin: false },
  { id: 7, name: '# public channel 1', icon: 'tag', isAdmin: false },
  { id: 8, name: '# public channel 2', icon: 'tag', isAdmin: false },
  { id: 9, name: '# public channel 3', icon: 'tag', isAdmin: false },
  { id: 10, name: '# public channel 4', icon: 'tag', isAdmin: false },
  { id: 11, name: '# public channel 5', icon: 'tag', isAdmin: false }
]

// 🔹 prop z parentu
const props = defineProps<{
  showPublic: boolean
}>()

// 🔹 computed reaktívny výber medzi my/public
const channels = computed<Channel[]>(() =>
  props.showPublic ? publicChannels : myChannels.value
)
</script>

<style lang="scss" scoped>
.channel-list-area {
  background-color: $sidebar-bg;
  color: $text-inverse;
  height: 100%;
}
</style>
