<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md" style="width: 350px">
      <q-btn 
          flat 
          round 
          icon="arrow_back" 
          color="grey-7"
          @click="goBack"
          class="q-mr-md"
       />
      
      <q-card-section class="text-center">
        <!-- Profilová ikona -->
        <q-avatar size="100px" class="q-mb-md">
            <q-icon name="account_circle" size="100px" />
        </q-avatar>
        <div class="text-h5">My nickanme</div>
        <div class="text-h6">John Doe</div>
        <div class="text-subtitle2 text-grey">johndoe@example.com</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-btn
          flat
          color="negative"
          label="Logout"
          icon="logout"
          @click="logout"
          class="full-width"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import store from 'src/store'

const router = useRouter()
const $q = useQuasar()

const logout = async () => {
  try {
    await store.dispatch('/logout')
  } catch {
    // ignore
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
