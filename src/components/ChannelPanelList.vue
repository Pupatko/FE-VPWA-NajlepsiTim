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
import { ref } from 'vue'
import ChannelPanelItem from './ChannelPanelItem.vue'

// Temporary data - later fetch from backend with user permissions
const channels = ref([
  { id: 1, name: '# general', icon: 'tag', isAdmin: true },
  { id: 2, name: '# random', icon: 'tag', isAdmin: false },
  { id: 3, name: '# dev', icon: 'tag', isAdmin: true },
  { id: 4, name: '# design', icon: 'tag', isAdmin: false },
  { id: 5, name: '# test kanal', icon: 'tag', isAdmin: false }
])
</script>

<style lang="scss" scoped>
.channel-list-area {
  background-color: $sidebar-bg;
  color: $text-inverse;
  height: 100%;
}
</style>
