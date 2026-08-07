<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <header class="ph">
    <div class="ph__text">
      <h1 class="ph__title">{{ title }}</h1>
      <p v-if="subtitle" class="ph__sub">{{ subtitle }}</p>
    </div>
    <div class="ph__actions"><slot name="actions" /></div>
  </header>
</template>

<style scoped>
.ph { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--sp-4); margin-bottom: var(--sp-6); }
.ph__title { font-size: clamp(22px, 3vw, 28px); }
.ph__sub { color: var(--text-muted); margin-top: 4px; font-size: 14.5px; }
.ph__actions { display: flex; gap: var(--sp-3); flex-shrink: 0; }
@media (max-width: 620px) { .ph { flex-direction: column; align-items: stretch; } }
</style>
