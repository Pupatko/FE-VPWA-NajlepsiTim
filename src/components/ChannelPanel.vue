<template>
  <div class="column fit channel-panel">
    <div class="panel-scroll">
      <channel-panel-header :show-public="showPublicAll" @toggle-public="togglePublicAll" />
      <channel-panel-type @type-change="setType" />
      <channel-panel-list :show-public-all="showPublicAll" :active-type="activeType" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import ChannelPanelHeader from './ChannelPanelHeader.vue'
import ChannelPanelType from './ChannelPanelType.vue'
import ChannelPanelList from './ChannelPanelList.vue'

const showPublicAll = ref(false)
const activeType = ref<'public' | 'private'>('public')

const togglePublicAll = () => {
  showPublicAll.value = !showPublicAll.value
}

const setType = (type: 'public' | 'private') => {
  activeType.value = type
}
</script>

<style lang="scss" scoped>
.channel-panel {
  width: 280px;
  background-color: $sidebar-bg;
  color: $text-inverse;
  border-right: 1px solid $border-light;
  min-height: 100%;
}

.panel-scroll {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
</style>
