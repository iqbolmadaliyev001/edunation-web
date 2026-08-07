<script setup>
import { RouterView } from 'vue-router'
import ToastHost from '@/components/ui/ToastHost.vue'
import AuthModal from '@/components/auth/AuthModal.vue'
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>

  <AuthModal />
  <ToastHost />
</template>

<style>
#app { min-height: 100vh; }
.page-enter-active, .page-leave-active { transition: opacity .18s ease; }
.page-enter-from, .page-leave-to { opacity: 0; }
</style>
