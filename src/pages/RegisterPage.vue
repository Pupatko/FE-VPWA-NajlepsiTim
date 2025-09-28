<template>

  <q-page class="register-page flex flex-center">
    <q-card class="register-card">

      <q-card-section>
        <div class="text-h4 text-center main-title">BondraGer</div>
        <div class="text-subtitle2 text-center sub-title">Register your account</div>
      </q-card-section>

      <q-card-section>
        <!-- first name , last name -->
        <div class="row q-gutter-md q-mb-md">
          <q-input
            v-model="firstName"
            label="First Name"
            outlined
            class="col"
            :rules="[val => !!val || 'First name is required']"
          />

          <q-input
            v-model="lastName"
            label="Last Name"
            outlined
            class="col"
            :rules="[val => !!val || 'Last name is required']"
          />
        </div>

        <!-- nickname -->
        <q-input
          v-model="nickName"
          label="Nickname"
          outlined
          class="q-mb-md"
          :rules="[val => !!val || 'Nickname is required']"
        />

        <!-- email -->
        <q-input
          v-model="email"
          label="Email"
          type="email"
          outlined
          class="q-mb-md"
          suffix="@gmail.com"  # deleteme
          :rules="[val => !!val || 'Email is required']"
        />

        <!-- pass -->
        <q-input
          v-model="password"
          label="Password"
          type="password"
          outlined
          class="q-mb-md"
          :rules="[val => !!val || 'Password is required']"
        />

        <!-- confirm pass -->
        <q-input
          v-model="confirmPassword"
          label="Confirm Password"
          type="password"
          outlined
          class="q-mb-lg"
          :rules="[
            val => !!val || 'Please confirm password',
            val => val === password || 'Passwords do not match'
          ]"
        />

        <q-btn
          label="Register Account"
          color="primary"
          class="full-width register-btn q-mb-md"
          size="lg"
        />

        <!-- "or" -->
        <div class="text-center q-mb-md">
          <q-separator class="q-mb-md" />
          <span class="text-caption divider-text">or</span>
        </div>

        <q-btn
          label="Log In"
          color="secondary"
          outline
          class="full-width login-btn"
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

// Form fields
const firstName = ref('')
const lastName = ref('')
const nickName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

// Registration Logic
const handleRegister = () => {
  const userData = {
    firstName: firstName.value,
    lastName: lastName.value,
    nickName: nickName.value,
    email: email.value,
    password: password.value
  }
  console.log('Register data:', userData)
  // API call to register the user would go here
}
</script>

<style lang="scss" scoped>
  .register-page {
    background-color: $chat-bg;
    min-height: 100vh;
    padding: 2rem;
  }

  .register-card {
    width: 450px;
    background: $message-area-bg;
    border-radius: $border-radius * 2;
    box-shadow: $shadow-medium;
  }

  .main-title {
    color: $primary;
    margin-bottom: 8px;
  }

  .sub-title {
    color: $text-secondary;
  }

  .register-btn {
    height: 48px;
    border-radius: $border-radius;
    font-weight: 600;
  }

  .login-btn {
    height: 48px;
    border-radius: $border-radius;
    font-weight: 600;
    border: 2px solid $secondary;
  }

  .login-btn:hover {
    background-color: $secondary;
    color: white;
  }

  .divider-text {
    color: $text-muted;
    background-color: $message-area-bg;
    padding: 0 12px;
    position: relative;
    top: -12px;
  }

  .login-text {
    color: $text-muted;
  }

  .login-link {
    color: $primary;
    text-decoration: none;
    font-weight: 500;
  }

  .login-link:hover {
    text-decoration: underline;
  }
</style>
