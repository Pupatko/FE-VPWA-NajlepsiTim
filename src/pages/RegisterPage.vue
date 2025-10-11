<template>
  <q-page class="register-page flex flex-center">
    <q-card class="register-card">

      <q-card-section class="text-center">
        <div class="text-h4 main-title">BondraGer</div>
        <div class="text-subtitle2 sub-title">Register your account</div>
      </q-card-section>

      <q-card-section>
        <!-- first name, last name -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col">
            <q-input
              v-model="firstName"
              label="First Name"
              outlined
            />
          </div>
          <div class="col">
            <q-input
              v-model="lastName"
              label="Last Name"
              outlined
            />
          </div>
        </div>

        <!-- nickname -->
        <q-input
          v-model="nickName"
          label="Nickname"
          outlined
          class="q-mb-md"
        />

        <!-- email -->
        <q-input
          v-model="email"
          label="Email"
          type="email"
          outlined
          class="q-mb-md"
        />

        <!-- password -->
        <q-input
          v-model="password"
          label="Password"
          type="password"
          outlined
          class="q-mb-md"
        />

        <!-- confirm password -->
        <q-input
          v-model="confirmPassword"
          label="Confirm Password"
          type="password"
          outlined
          class="q-mb-lg"
        />

        <q-btn
          label="Register Account"
          color="primary"
          unelevated
          class="full-width q-mb-md"
          size="lg"
          @click="handleRegister"
        />

        <!-- divider -->
        <div class="row items-center q-my-md">
          <q-separator class="col" />
          <div class="text-caption divider-text q-px-md">or</div>
          <q-separator class="col" />
        </div>

        <q-btn
          label="Log In"
          color="secondary"
          outline
          class="full-width"
          size="lg"
          to="/login"
        />
      </q-card-section>

      <!-- /login link -->
      <q-card-section class="text-center q-pt-none">
        <div class="text-body2 login-text">
          Already have an account? 
          <router-link to="/login" class="login-link">
            Log in here
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

const firstName = ref('')
const lastName = ref('')
const nickName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const router = useRouter()
const $q = useQuasar()

const handleRegister = () => {
  // TODO: Replace with real API call
  router.push('/channel')
}
</script>

<style lang="scss" scoped>
.register-page {
  background-color: $chat-bg;
  min-height: 100vh;
}

.register-card {
  width: 100%;
  max-width: 450px;
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

.login-text {
  color: $text-secondary;
}

.login-link {
  color: $primary;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
}
</style>
