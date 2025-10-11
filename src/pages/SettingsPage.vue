<template>
    <q-page class="settings-page">
       <q-header elevated class="row q-pa-sm">
        <q-btn flat round dense icon="arrow_back" @click="$router.back()" />
        <q-toolbar-title>Settings</q-toolbar-title>
       </q-header>
        <div class="q-gutter-sm q-pa-lg">
          
          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-checkbox v-model="val" val="orange"/>
            </q-item-section>
            <q-item-section>
              <q-item-label>Notifications</q-item-label>
              <q-item-label caption>User will recieve message notifications</q-item-label>
            </q-item-section>
          </q-item>

          <q-select class = "settings-component" rounded outlined v-model="model" :options="options" label="Select a state"/>
        </div> 
    </q-page>
</template>

<script>
import { ref } from 'vue'
export default {
  setup () {
    return {
      val: ref(true),
    
      model: ref(null),
      options: [
        'Active', 'Do not Disturb', 'Offline'
      ]
    }
  }
}

</script>

<style lang="scss">
    .settings-page {
        align-items: left;
    }

    .settings-component {
        margin-top: 20px;
        width: 300px;
    }


</style>