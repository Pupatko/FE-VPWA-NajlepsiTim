<template>
  <q-page class="settings-page">
    <div class="settings-container">
      <div class="settings-header q-mb-lg">
        <q-btn flat round icon="arrow_back" color="grey-7" @click="goBack" class="q-mr-md" />
        <div class="text-h4">Settings</div>
      </div>

      <div class="settings-content">
        <!-- Notification Settings -->
        <q-card flat bordered class="settings-card q-mb-lg">
          <q-card-section>
            <div class="text-h6 q-mb-sm">
              <q-icon name="notifications" color="primary" class="q-mr-sm" />
              Notification Preferences
            </div>
            <div class="text-caption text-grey-7 q-mb-md">
              Choose when you want to receive notifications
            </div>

            <q-option-group
              v-model="notificationSettings"
              :options="notificationOptions"
              color="primary"
              type="radio"
            />

            <q-separator class="q-my-md" />
            <div class="text-caption text-grey-7">
              <q-icon name="info" size="xs" class="q-mr-xs" />
              Notifications are only shown when the app is not visible
            </div>
          </q-card-section>
        </q-card>

        <!-- Activity Status (placeholder) -->
        <q-card flat bordered class="settings-card q-mb-lg">
          <q-card-section>
            <div class="text-h6 q-mb-sm">
              <q-icon name="circle" :color="getStatusColor(activityStatus)" class="q-mr-sm" />
              Activity Status
            </div>
            <div class="text-caption text-grey-7 q-mb-md">
              This is a placeholder. Status will be synced via WebSocket.
            </div>

            <q-option-group
              v-model="activityStatus"
              :options="activityOptions"
              color="primary"
              type="radio"
            />

            <q-separator class="q-my-md" />
            <div class="text-caption text-grey-7">
              <q-icon name="info" size="xs" class="q-mr-xs" />
              Your status will be synced in real-time
            </div>
          </q-card-section>
        </q-card>

        <!-- Save Button -->
        <div class="row justify-end q-mt-lg">
          <q-btn label="Save Changes" color="primary" unelevated @click="saveSettings" class="q-px-lg" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useStore } from 'vuex'
import authService, { User } from 'src/services/auth.service'

const router = useRouter()
const $q = useQuasar()
const store = useStore()

// Notification settings (backend: 'all' | 'mentions_only')
const notificationSettings = ref<'all' | 'mentions_only'>('all')
const notificationOptions = [
  {
    label: 'All Messages',
    value: 'all',
    description: 'Receive notifications for every new message in channels',
  },
  {
    label: 'Mentioned Only',
    value: 'mentions_only',
    description: 'Only get notified when someone mentions you with @nickname',
  },
]

// Activity status (frontend: 'online' | 'dnd' | 'offline')
const activityStatus = ref<'online' | 'dnd' | 'offline'>('online')
const activityOptions = [
  { label: 'Online', value: 'online', color: 'online-status' },
  { label: 'Do Not Disturb', value: 'dnd', color: 'dnd-status' },
  { label: 'Offline', value: 'offline', color: 'offline-status' },
]

// farba ikonky podľa statusu
const getStatusColor = (status: 'online' | 'dnd' | 'offline') => {
  const statusMap: Record<string, string> = {
    online: 'online-status',
    dnd: 'dnd-status',
    offline: 'offline-status',
  }
  return statusMap[status] || 'grey'
}

// načítaj aktuálne hodnoty zo store po otvorení stránky
onMounted(() => {
  const user = store.state.auth.user as User | null

  if (user) {
    // backend -> frontend
    notificationSettings.value = user.notificationMode

    if (user.state === 1) activityStatus.value = 'online'
    else if (user.state === 2) activityStatus.value = 'dnd'
    else if (user.state === 3) activityStatus.value = 'offline'
  }

  // ak nie je v localStorage nič, inicializuj
  const existing = localStorage.getItem('notificationSettings')
  if (!existing) {
    localStorage.setItem(
      'notificationSettings',
      JSON.stringify({
        type: notificationSettings.value === 'all' ? 'all' : 'mentions',
        showPreview: true,
        state: activityStatus.value,
      })
    )
  }
})

const saveSettings = async () => {
  try {
    // frontend string -> backend číslo
    const stateNumber: 1 | 2 | 3 =
      activityStatus.value === 'online'
        ? 1
        : activityStatus.value === 'dnd'
        ? 2
        : 3

    const updatedUser = await authService.updateSettings({
      notificationMode: notificationSettings.value,
      state: stateNumber,
    })

    // update usera v store
    store.commit('auth/SET_USER', updatedUser)

    // uložiť aj do localStorage pre messageNotifications
    localStorage.setItem(
      'notificationSettings',
      JSON.stringify({
        type: notificationSettings.value === 'all' ? 'all' : 'mentions',
        showPreview: true,
        state: activityStatus.value,
      })
    )

    $q.notify({
      type: 'positive',
      message: 'Settings updated successfully',
      icon: 'check_circle',
    })
  } catch (err) {
    console.error(err)
    $q.notify({
      type: 'negative',
      message: 'Failed to update settings',
      icon: 'error',
    })
  }
}

const goBack = () => router.push('/')
</script>

<style scoped lang="scss">
.settings-page { padding: 20px; background-color: $chat-bg; min-height: 100vh; }
.settings-container { max-width: 800px; margin: 0 auto; }
.settings-card { background-color: $message-area-bg; border-radius: $border-radius; box-shadow: $shadow-medium; }
</style>
