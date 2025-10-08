<template>
  <div class="q-pa-sm flex items-center justify-between channel-panel-header">
    <div class="text-h6 text-white">Channels</div>
    <q-btn flat dense round icon="add" color="white"
      @click="addChannel"
      aria-label="Add channel"
    />
  </div>
</template>

<script setup>
const addChannel = () => {
  console.log('Add channel clicked')
  // sem neskôr pridáš emit alebo otvoríš dialóg
}
</script>

<style scoped>
.channel-panel-header {
  background-color: #2c2c3a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
