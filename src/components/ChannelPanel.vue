<template>
  <div class="column fit channel-panel">
    <channel-panel-header />
    <channel-panel-type />
    <div class="col-grow">
      <channel-panel-list />
    </div>
  </div>
</template>

<script lang="ts" setup>
import ChannelPanelHeader from './ChannelPanelHeader.vue'
import ChannelPanelType from './ChannelPanelType.vue'
import ChannelPanelList from './ChannelPanelList.vue'
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
