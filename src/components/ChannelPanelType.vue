<template>
  <div class="q-pa-sm flex justify-around channel-type">
    <q-btn
      :color="activeType === 'public' ? 'primary' : 'grey-8'"
      label="Public"
      flat
      @click="setType('public')"
    />
    <q-btn
      :color="activeType === 'private' ? 'primary' : 'grey-8'"
      label="Private"
      flat
      @click="setType('private')"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeType = ref('public')

const setType = (type) => {
  activeType.value = type
  console.log('Selected type:', type)
  // emit('type-change', type)  // neskôr pre prepojenie s listom
}
</script>

<style scoped>
.channel-type {
  background-color: #252533;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
