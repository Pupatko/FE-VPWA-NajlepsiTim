<template>
  <q-page class="flex flex-center create-channel-page">
    <q-card class="create-channel-card" flat bordered>
      <q-card-section class="card-header">
        <div class="text-h5">Create Channel</div>
        <div class="text-subtitle2 text-secondary">Create a new communication channel</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Channel Name -->
          <q-input
            filled
            v-model="channelName"
            label="Channel Name"
            placeholder="e.g. general, random, team-chat"
            :rules="[
              val => val && val.length > 0 || 'Channel name is required',
              val => val.length >= 3 || 'Minimum 3 characters',
              val => /^[a-zA-Z0-9-_]+$/.test(val) || 'Only letters, numbers, dashes and underscores'
            ]"
            lazy-rules
            counter
            maxlength="50"
          >
            <template v-slot:prepend>
              <q-icon name="tag" />
            </template>
          </q-input>

          <!-- Channel Type -->
          <div class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">Channel Type</div>
            <q-option-group
              v-model="channelType"
              :options="channelOptions"
              color="primary"
              inline
            >
              <template v-slot:label="opt">
                <div class="row items-center">
                  <q-icon :name="opt.icon" size="sm" class="q-mr-sm" />
                  <div>
                    <div class="text-weight-medium">{{ opt.label }}</div>
                    <div class="text-caption text-grey-7">{{ opt.description }}</div>
                  </div>
                </div>
              </template>
            </q-option-group>
          </div>

          <!-- Buttons -->
          <div class="row q-mt-lg q-gutter-sm">
            <q-btn
              label="Cancel"
              flat
              color="grey-7"
              @click="onCancel"
              class="col"
            />
            <q-btn
              label="Create Channel"
              type="submit"
              color="primary"
              unelevated
              class="col"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import api from 'src/api/axios'

export default {
  name: 'CreateChannelPage',
  setup() {
    const router = useRouter()
    const $q = useQuasar()
    
    const channelName = ref('')
    const channelType = ref('public')
    
    const channelOptions = [
      {
        label: 'Public',
        value: 'public',
        icon: 'public',
        description: 'Anyone can see and join'
      },
      {
        label: 'Private',
        value: 'private',
        icon: 'lock',
        description: 'Only invited members have access'
      }
    ]

  const onSubmit = async () => {
    try {
      const res = await api.post('/join', {
        channelName: channelName.value,
        channelType: channelType.value,
      })

      $q.notify({
        type: 'positive',
        message: `Channel #${channelName.value} created successfully`,
        icon: 'check_circle'
      })

      router.push('/')
    } catch (err) {
      console.error(err)
      $q.notify({
        type: 'negative',
        message: 'Failed to create channel',
        icon: 'error'
      })
    }
  }

    const onCancel = () => {
      router.push('/')
    }

    return {
      channelName,
      channelType,
      channelOptions,
      onSubmit,
      onCancel
    }
  }
}
</script>

<style lang="scss" scoped>
.create-channel-page {
  background-color: $chat-bg;
  min-height: 100vh;
  padding: 20px;
}

.create-channel-card {
  width: 100%;
  max-width: 600px;
  background-color: $message-area-bg;
  border-radius: $border-radius;
  box-shadow: $shadow-medium;
}

.card-header {
  background-color: $message-area-bg;
}

.text-secondary {
  color: $text-secondary;
}
</style>
