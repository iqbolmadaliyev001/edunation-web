<script setup>
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
</script>

<template>
  <div class="nf container">
    <div class="nf__code grad-text">404</div>
    <h1 class="nf__title">Sahifa topilmadi</h1>
    <p class="nf__text">Kechirasiz, siz qidirgan sahifa mavjud emas yoki ko'chirilgan.</p>
    <RouterLink :to="{ name: 'home' }">
      <BaseButton size="lg" icon="chevron-left">Bosh sahifaga</BaseButton>
    </RouterLink>
  </div>
</template>

<style scoped>
.nf { text-align: center; padding-block: var(--sp-30); display: flex; flex-direction: column; align-items: center; }
.nf__code { font-family: var(--font-display); font-weight: 800; font-size: clamp(80px, 18vw, 160px); line-height: 1; letter-spacing: -0.04em; }
.nf__title { font-size: clamp(24px, 4vw, 34px); margin-top: var(--sp-3); }
.nf__text { color: var(--text-soft); margin: var(--sp-3) 0 var(--sp-8); max-width: 40ch; }
</style>
