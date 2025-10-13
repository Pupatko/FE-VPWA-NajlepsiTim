<template>
  <div class="q-pa-sm flex-col channel-panel-header">

    <div class="flex items-center justify-between">
      <div class="text-h6 text-white">Channels</div>
      <q-btn
        flat
        dense
        round
        icon="add"
        color="white"
        @click="addChannel"
        aria-label="Add channel"
      />
    </div>

    <div
      class="text-subtitle2 text-blue-4 cursor-pointer q-mt-xs hover:underline"
      @click="viewAll"
    >
      {{ props.showPublic ? 'Back to my channels' : 'View all public channels' }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { defineEmits } from 'vue'

const props = defineProps({
  showPublic: {
    type: Boolean,
    required: true
  }
})

const router = useRouter()
const emit = defineEmits(['togglePublic'])

const togglePublic = () => emit('togglePublic')
const addChannel = () => {
  console.log('Add channel clicked')
  router.push('/create-channel')
}

const viewAll = () => {
  if (!props.showPublic) {
    // ak nie sme v public mode, otvor public channels stránku
    router.push('/public-channels')
  } else {
    emit('togglePublic') // ak sme už v public view, len sa vráť späť do private listu
  }
}
</script>

<style lang="scss" scoped>
.channel-panel-header {
  background-color: $dark;
  border-bottom: 1px solid $border-light;
  .hover\:underline:hover {
    text-decoration: underline;
  }
}
</style>
