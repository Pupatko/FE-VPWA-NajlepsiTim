<template>
  <div class="column fit channel-panel">
    <channel-panel-header />
    <channel-panel-type />
    <div class="col-grow">
      <channel-panel-list />
    </div>
  </div>
</template>

<script setup>
import ChannelPanelHeader from './ChannelPanelHeader.vue'
import ChannelPanelType from './ChannelPanelType.vue'
import ChannelPanelList from './ChannelPanelList.vue'
</script>

<style scoped>
.channel-panel {
  width: 260px;
  background-color: #1e1e2f;
  color: white;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
