<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md" style="width: 350px">
      <div class="row items-center q-mb-md">
        <q-btn 
          flat 
          round 
          icon="arrow_back" 
          color="grey-7"
          @click="goBack"
          class="q-mr-sm"
        />
        <div class="text-subtitle1">Profile</div>
      </div>
      
      <q-card-section class="text-center">
        <!-- Profilová ikona -->
        <q-avatar size="100px" class="q-mb-md">
          <q-icon name="account_circle" size="100px" />
        </q-avatar>

        <!-- Loading -->
        <div v-if="loading" class="q-mt-md">
          <q-spinner size="24px" color="primary" />
        </div>

        <!-- Nickname -->
        <div v-else>
          <div class="text-h5">
            {{ user?.nickName || 'Nickname' }}
          </div>

          <!-- Full name -->
          <div class="text-h6 q-mt-xs">
            <span v-if="user">
              {{ user.firstName }} {{ user.lastName }}
            </span>
            <span v-else>
              &nbsp;
            </span>
          </div>

          <!-- Email -->
          <div class="text-subtitle2 text-grey q-mt-xs">
            {{ user?.email || '' }}
          </div>

          <!-- Stav -->
          <div class="q-mt-sm text-caption">
            <q-badge
              v-if="user"
              :color="statusColor"
              rounded
              class="q-mr-xs"
            />
            <span v-if="user">
              {{ statusLabel }}
            </span>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-btn
          flat
          color="negative"
          label="Log out"
          icon="logout"
          class="full-width"
          @click="logout"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import store from 'src/store'
import authManager from 'src/services/auth-manager'
import authService, { User as MeUser } from 'src/services/auth.service'

const router = useRouter()
const $q = useQuasar()

const user = ref<MeUser | null>(null)
const loading = ref(true)

// načítaj reálne údaje z /auth/me
onMounted(async () => {
  try {
    const me = await authService.me()
    user.value = me
  } catch (err) {
    console.error('Failed to load profile', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to load profile information',
    })
  } finally {
    loading.value = false
  }
})

// textová reprezentácia stavu
const statusLabel = computed(() => {
  if (!user.value) return ''
  switch (user.value.state) {
    case 1:
      return 'Online'
    case 2:
      return 'Do Not Disturb'
    case 3:
      return 'Offline'
    default:
      return ''
  }
})

// farbička pre badge
const statusColor = computed(() => {
  if (!user.value) return 'grey'
  switch (user.value.state) {
    case 1:
      return 'green'
    case 2:
      return 'orange'
    case 3:
      return 'grey'
    default:
      return 'grey'
  }
})

const logout = async () => {
  try {
    await store.dispatch('auth/logout')
    authManager.logout()
  } catch (e) {
    // ignorujeme chybu, aj tak vymažeme token lokálne
    authManager.logout()
  }

  $q.notify({ message: 'Logged out!', color: 'negative' })
  router.push('/login')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.q-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
