<template>
  <q-item clickable v-ripple @click="selectChannel">
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

<style scoped>
.q-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}
</style>
