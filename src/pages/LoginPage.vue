<template>

  <q-page class="login-page flex flex-center">
    <q-card class="login-card">

      <q-card-section>
        <div class="text-h4 text-center main-title">BondraGer</div>
        <div class="text-subtitle2 text-center sub-title">Log in to continue</div>
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
          class="full-width login-btn q-mb-md"
          size="lg"
        />

        <!-- divider -->
        <div class="text-center q-mb-md">
          <q-separator class="q-mb-md" />
          <span class="text-caption divider-text">or</span>
        </div>

        <q-btn
          label="Register Account"
          color="secondary"
          outline
          class="full-width register-btn"
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

const email = ref('')
const password = ref('')
</script>

<style lang="scss" scoped>
  .login-page {
    background-color: $chat-bg;
    min-height: 100vh;
    padding: 2rem;
  }

  .login-card {
    width: 400px;
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

  .login-btn {
    height: 48px;
    border-radius: $border-radius;
    font-weight: 600;
  }

  .register-btn {
    height: 48px;
    border-radius: $border-radius;
    font-weight: 600;
    border: 2px solid $secondary;
  }

  .register-btn:hover {
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

  .register-text {
    color: $text-muted;
  }

  .register-link {
    color: $primary;
    text-decoration: none;
    font-weight: 500;
  }

  .register-link:hover {
    text-decoration: underline;
  }
</style>
