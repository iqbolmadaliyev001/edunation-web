<script setup>
import { RouterView } from 'vue-router'
import PublicHeader from '@/components/layout/PublicHeader.vue'
import PublicFooter from '@/components/layout/PublicFooter.vue'
</script>

<template>
  <div class="public">
    <PublicHeader />
    <main class="public__main">
      <RouterView />
    </main>
    <PublicFooter />
  </div>
</template>

<style scoped>
.public { display: flex; flex-direction: column; min-height: 100vh; background: var(--surface); }
.public__main { flex: 1; }
</style>
