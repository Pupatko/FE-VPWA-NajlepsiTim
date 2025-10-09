<template>
  <q-scroll-area class="fit channel-list-area">
    <q-list>
      <ChannelPanelItem
        v-for="ch in channels"
        :key="ch.id"
        :name="ch.name"
        :icon="ch.icon"
      />
    </q-list>
  </q-scroll-area>
</template>

<script setup>
import { ref } from 'vue'
import ChannelPanelItem from './ChannelPanelItem.vue'

// dal som temporary data, neskôr to bude fetchované z backendu
const channels = ref([
  { id: 1, name: '# general', icon: 'tag' },
  { id: 2, name: '# random', icon: 'tag' },
  { id: 3, name: '# dev', icon: 'tag' },
  { id: 4, name: '# design', icon: 'tag' },
  { id: 5, name: '# test kanal', icon: 'tag' }
])
</script>

<style lang="scss" scoped>
.channel-list-area {
  background-color: $sidebar-bg;
  color: $text-inverse;
  height: 100%;
}
</style>
