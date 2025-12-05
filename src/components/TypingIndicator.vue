<template>
  <div v-if="users.length > 0" class="typing-indicator row q-col-gutter-sm q-px-sm q-py-sm">
    <q-chip
      v-for="user in users"
      :key="user"
      color="primary"
      text-color="white"
      icon="person"
    >
      {{ user }}
      <q-spinner-dots color="white" size="16px" class="q-ml-xs" />
    </q-chip>
  </div>
</template>

<script setup lang="ts">
defineProps({
  users: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.typing-indicator {
  flex-wrap: wrap;
}
</style>
