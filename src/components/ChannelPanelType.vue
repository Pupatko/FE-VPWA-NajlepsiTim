<template>
  <div class="channel-type bg-dark q-px-sm q-py-xs">
    <q-btn-toggle
      v-model="activeType"
      dense
      spread
      no-caps
      toggle-color="channel-active"
      color="grey-7"
      text-color="white"
      class="full-width"
      @update:model-value="setType"
      :options="[
        { label: 'Public', value: 'public' },
        { label: 'Private', value: 'private' }
      ]"
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
}
</style>
