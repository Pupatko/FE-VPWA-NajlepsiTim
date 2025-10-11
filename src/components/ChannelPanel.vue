<template>
  <div class="column fit channel-panel">
    <channel-panel-header :show-public="showPublic" @toggle-public="togglePublic" />
    <channel-panel-type />
    <div class="col-grow">
      <channel-panel-list :show-public="showPublic" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import ChannelPanelHeader from './ChannelPanelHeader.vue'
import ChannelPanelType from './ChannelPanelType.vue'
import ChannelPanelList from './ChannelPanelList.vue'

const showPublic = ref(false)

const togglePublic = () => {
  showPublic.value = !showPublic.value
}
</script>

<style lang="scss" scoped>
.channel-panel {
  width: 260px;
  background-color: $sidebar-bg;
  color: $text-inverse;
  display: flex;
  flex-direction: column;
  border-right: 1px solid $border-light;
}
</style>
