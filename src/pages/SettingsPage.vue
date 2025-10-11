<template>
  <q-page class="settings-page">
    <div class="settings-container">
      <div class="settings-header q-mb-lg">
        <q-btn 
          flat 
          round 
          icon="arrow_back" 
          color="grey-7"
          @click="goBack"
          class="q-mr-md"
        />
        <div class="text-h4">Settings</div>
      </div>

      <div class="settings-content">
        <!-- Notification Settings Card -->
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
            >
              <template v-slot:label="opt">
                <div class="q-py-sm">
                  <div class="text-weight-medium">{{ opt.label }}</div>
                  <div class="text-caption text-grey-7">{{ opt.description }}</div>
                </div>
              </template>
            </q-option-group>

            <q-separator class="q-my-md" />

            <div class="text-caption text-grey-7">
              <q-icon name="info" size="xs" class="q-mr-xs" />
              Notifications are only shown when the app is not visible
            </div>
          </q-card-section>
        </q-card>

        <!-- Activity Status Card -->
        <q-card flat bordered class="settings-card q-mb-lg">
          <q-card-section>
            <div class="text-h6 q-mb-sm">
              <q-icon name="circle" :color="getStatusColor(activityStatus)" class="q-mr-sm" />
              Activity Status
            </div>
            <div class="text-caption text-grey-7 q-mb-md">
              Set your current activity status
            </div>

            <q-option-group
              v-model="activityStatus"
              :options="activityOptions"
              color="primary"
              type="radio"
            >
              <template v-slot:label="opt">
                <div class="row items-center q-py-sm">
                  <q-icon 
                    name="circle" 
                    :color="opt.color" 
                    size="sm" 
                    class="q-mr-md"
                  />
                  <div>
                    <div class="text-weight-medium">{{ opt.label }}</div>
                    <div class="text-caption text-grey-7">{{ opt.description }}</div>
                  </div>
                </div>
              </template>
            </q-option-group>

            <q-separator class="q-my-md" />

            <div class="text-caption text-grey-7">
              <q-icon name="info" size="xs" class="q-mr-xs" />
              Your status is visible to all users in the application
            </div>
          </q-card-section>
        </q-card>

        <!-- Logout Card -->
        <q-card flat bordered class="settings-card q-mb-lg logout-card">
          <q-card-section>
            <div class="text-h6 q-mb-sm">
              <q-icon name="logout" color="negative" class="q-mr-sm" />
              Logout
            </div>
            <div class="text-caption text-grey-7 q-mb-md">
              Sign out of your account
            </div>

            <q-btn
              label="Logout"
              icon="logout"
              color="negative"
              outline
              @click="handleLogout"
              class="full-width"
            />
          </q-card-section>
        </q-card>

        <!-- Save Button -->
        <div class="row justify-end q-mt-lg">
          <q-btn
            label="Save Changes"
            color="primary"
            unelevated
            @click="saveSettings"
            class="q-px-lg"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

// Notification settings
const notificationSettings = ref('all')
const notificationOptions = [
  {
    label: 'All Messages',
    value: 'all',
    description: 'Receive notifications for every new message in channels'
  },
  {
    label: 'Mentioned Only',
    value: 'mentions',
    description: 'Only get notified when someone mentions you with @nickname'
  },
  {
    label: 'Disabled',
    value: 'disabled',
    description: 'No notifications will be sent'
  }
]

// Activity status settings
const activityStatus = ref('online')
const activityOptions = [
  {
    label: 'Online',
    value: 'online',
    color: 'online-status',
    description: 'You are active and receive all messages and notifications'
  },
  {
    label: 'Do Not Disturb',
    value: 'dnd',
    color: 'dnd-status',
    description: 'You are active but notifications are muted'
  },
  {
    label: 'Offline',
    value: 'offline',
    color: 'offline-status',
    description: 'You appear inactive, channels update when you go online'
  }
]

const getStatusColor = (status) => {
  const statusMap = {
    'online': 'online-status',
    'dnd': 'dnd-status',
    'offline': 'offline-status'
  }
  return statusMap[status] || 'grey'
}

const goBack = () => {
  router.push('/')
}

const saveSettings = () => {
  console.log('Saving settings:', {
    notifications: notificationSettings.value,
    status: activityStatus.value
  })

  $q.notify({
    type: 'positive',
    message: 'Settings saved successfully',
    icon: 'check_circle',
    position: 'top'
  })
}

const handleLogout = () => {
    // TODO: logout logic
  router.replace('/login')
}
</script>

<style lang="scss" scoped>
.settings-page {
  background-color: $chat-bg;
  min-height: 100vh;
  padding: 20px;
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  display: flex;
  align-items: center;
  color: $text-primary;
}

.settings-card {
  background-color: $message-area-bg;
  border-radius: $border-radius;
  box-shadow: $shadow-medium;
}

.logout-card {
  border-color: $negative;
  border-width: 1px;
}

.q-option-group {
  :deep(.q-radio) {
    margin-bottom: 8px;
  }
}
</style>
