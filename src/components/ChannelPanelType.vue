<template>
  <div class="channel-type bg-dark q-px-sm q-py-xs">
    <q-btn-toggle
      v-model="activeType"
      dense
      spread
      no-caps
      rounded
      unelevated
      toggle-color="primary"
      color="transparent"
      text-color="grey-5"
      class="full-width channel-toggle"
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

.channel-toggle :deep(.q-btn) {
  border: 1px solid transparent;
}

.channel-toggle :deep(.q-btn--active) {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
  color: $text-inverse;
}

.channel-toggle :deep(.q-btn:not(.q-btn--active)) {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
  color: $text-muted;
}
</style>
