<template>
  <div class="channel-type bg-dark q-px-sm q-py-sm row items-center q-gutter-sm">
    <q-btn
      :color="activeType === 'public' ? 'channel-active' : 'grey-6'"
      label="Public"
      flat
      no-caps
      dense
      class="col rounded-borders"
      @click="setType('public')"
    />
    <q-btn
      :color="activeType === 'private' ? 'channel-active' : 'grey-6'"
      label="Private"
      flat
      no-caps
      dense
      class="col rounded-borders"
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
