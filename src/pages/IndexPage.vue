<template>
    <q-page class="flex flex-center">
        <div class="text-center">
            <q-icon name="chat_bubble_outline" size="64px" color="grey-6" />
        <div class="text-h6 q-mt-md text-grey-6">Select a channel to start chatting</div>
        <q-btn
            flat
            color="primary"
            label="Create Channel"
            class="q-mt-md"
            to="/create-channel"
        />
        </div>
    </q-page>
</template>

<script setup lang="ts">
    // Empty state page when no channel is selected
</script>

<style lang="scss" scoped>
    .q-page {
    background-color: $chat-bg;
    }
</style>