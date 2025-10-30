<template>
  <div v-if="users.length > 0" class="typing-indicator">
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

<script setup>
defineProps({
  users: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.typing-indicator {
  padding: 8px 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
