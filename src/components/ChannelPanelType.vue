<template>
  <div class="q-pa-sm flex justify-around channel-type">
    <q-btn
      :color="activeType === 'public' ? 'channel-active' : 'grey-6'"
      label="Public"
      flat
      @click="setType('public')"
    />
    <q-btn
      :color="activeType === 'private' ? 'channel-active' : 'grey-6'"
      label="Private"
      flat
      @click="setType('private')"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeType = ref<'public' | 'private'>('public')

const emit = defineEmits<{
  (e: 'type-change', type: 'public' | 'private'): void
}>()

const setType = (type: 'public' | 'private') => {
  activeType.value = type
  console.log('Selected type:', type)
  emit('type-change', type)
}
</script>

<style lang="scss" scoped>
.channel-type {
  background-color: $sidebar-bg;
  border-bottom: 1px solid $border-light;
  
  .q-btn {
    color: $text-inverse;
  }
}
</style>
