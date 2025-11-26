<template>
  <q-page class="register-page flex flex-center">
    <q-card class="register-card">

      <q-card-section class="text-center">
        <div class="text-h4 main-title">BondraGer</div>
        <div class="text-subtitle2 sub-title">Register your account</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col">
            <q-input
              v-model="firstName"
              label="First Name"
              outlined
              :disable="loading"
            />
          </div>
          <div class="col">
            <q-input
              v-model="lastName"
              label="Last Name"
              outlined
              :disable="loading"
            />
          </div>
        </div>

        <q-input
          v-model="nickName"
          label="Nickname"
          outlined
          class="q-mb-md"
          :disable="loading"
        />

        <q-input
          v-model="email"
          label="Email"
          type="email"
          outlined
          class="q-mb-md"
          :disable="loading"
        />

        <q-input
          v-model="password"
          label="Password"
          type="password"
          outlined
          class="q-mb-md"
          :disable="loading"
        />

        <q-input
          v-model="confirmPassword"
          label="Confirm Password"
          type="password"
          outlined
          class="q-mb-lg"
          :disable="loading"
          @keyup.enter="handleRegister"
        />

        <q-btn
          label="Register Account"
          color="primary"
          unelevated
          class="full-width q-mb-md"
          size="lg"
          :loading="loading"
          @click="handleRegister"
        />

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
          :disable="loading"
        />
      </q-card-section>

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
import authService from 'src/services/auth.service'
import authManager from 'src/services/auth-manager'

const firstName = ref('')
const lastName = ref('')
const nickName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const router = useRouter()
const $q = useQuasar()

const handleRegister = async () => {
  if (!firstName.value || !lastName.value || !nickName.value || !email.value || !password.value) {
    $q.notify({ type: 'warning', message: 'Please fill in all fields' })
    return
  }

  if (password.value !== confirmPassword.value) {
    $q.notify({ type: 'negative', message: 'Passwords do not match' })
    return
  }

  loading.value = true

  try {
    const response = await authService.register({
      firstName: firstName.value,
      lastName: lastName.value,
      nickName: nickName.value,
      email: email.value,
      password: password.value,
    })

    authManager.setToken(response.token)

    $q.notify({ type: 'positive', message: 'Registration successful!' })

    router.push('/channels')
  } catch (err: any) {
    const msg = err?.response?.data?.message || 'Registration failed'
    $q.notify({ type: 'negative', message: msg })
  } finally {
    loading.value = false
  }
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
