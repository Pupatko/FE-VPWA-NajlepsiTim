<template>
  <q-page class="login-page flex flex-center">
    <q-card class="login-card">

      <q-card-section class="text-center">
        <div class="text-h4 main-title">BondraGer</div>
        <div class="text-subtitle2 sub-title">Log in to continue</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="email"
          label="Email"
          outlined
          class="q-mb-md"
        />

        <q-input
          v-model="password"
          label="Password"
          type="password"
          outlined
          class="q-mb-lg"
        />

        <q-btn
          label="Log In"
          color="primary"
          unelevated
          class="full-width q-mb-md"
          size="lg"
          @click="handleLogin"
        />

        <!-- divider -->
        <div class="row items-center q-my-md">
          <q-separator class="col" />
          <div class="text-caption divider-text q-px-md">or</div>
          <q-separator class="col" />
        </div>

        <q-btn
          label="Register Account"
          color="secondary"
          outline
          class="full-width"
          size="lg"
          to="/register"
        />
      </q-card-section>

      <!-- /register link -->
      <q-card-section class="text-center q-pt-none">
        <div class="text-body2 register-text">
          Don't have an account? 
          <router-link to="/register" class="register-link">
            Register one here
          </router-link>
        </div>
      </q-card-section>

    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const email = ref('')
const password = ref('')
const router = useRouter()
const $q = useQuasar()

const handleLogin = () => {
  // TODO: Replace with real API call
  router.push('/channel')
}
</script>

<style lang="scss" scoped>
.login-page {
  background-color: $chat-bg;
  min-height: 100vh;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background-color: $message-area-bg;
  border-radius: $border-radius * 2;
  box-shadow: $shadow-medium;
}

.main-title {
  color: $primary;
  font-weight: 700;
}

.sub-title {
  color: $text-secondary;
}

.divider-text {
  color: $text-muted;
}

.register-text {
  color: $text-secondary;
}

.register-link {
  color: $primary;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
}
</style>
