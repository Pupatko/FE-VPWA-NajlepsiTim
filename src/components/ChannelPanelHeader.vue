<template>
<div class="channel-panel-header q-pa-md column q-gutter-xs text-white">
    <div class="row items-center justify-between no-wrap">
      <div>
        <div class="text-h6 text-weight-bold">Channels</div>
        <div class="text-caption text-blue-2 cursor-pointer hover-underline" @click="viewAll">
          View all public channels
        </div>
      </div>
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
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const addChannel = () => {
  console.log('Add channel clicked')
  router.push('/create-channel')
}

const viewAll = () => {
  // ak nie sme v public mode, otvor public channels stránku
  router.push('/public-channels')
}

</script>

<style lang="scss" scoped>
.channel-panel-header {
  background-color: $dark;
  border-bottom: 1px solid $border-light;
}

.hover-underline:hover {
  text-decoration: underline;
}
</style>
