<template>
  <q-item clickable v-ripple @click="selectChannel" class="channel-item">
    <q-item-section avatar>
      <q-icon :name="icon" />
    </q-item-section>
    <q-item-section>{{ name }}</q-item-section>
  </q-item>
</template>

<script setup>
const props = defineProps({
  name: String,
  icon: {
    type: String,
    default: 'tag'
  }
})

const selectChannel = () => {
  console.log('Selected channel:', props.name)
}
</script>

<style lang="scss" scoped>
.channel-item {
  color: $text-inverse;
  
  &:hover {
    background-color: $channel-hover;
    color: $text-primary;
  }
  
  &.q-item--active {
    background-color: $channel-active;
    color: $primary;
    font-weight: 600;
  }
}
</style>
