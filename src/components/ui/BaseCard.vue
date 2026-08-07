<script setup>
defineProps({
  hover: { type: Boolean, default: false },
  pad: { type: String, default: 'md' }, // none | sm | md | lg
  as: { type: String, default: 'div' },
})
</script>

<template>
  <component :is="as" class="card" :class="[`card--pad-${pad}`, { 'card--hover': hover }]">
    <slot />
  </component>
</template>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow .2s ease, border-color .2s ease, transform .2s ease;
}
.card--pad-none { padding: 0; }
.card--pad-sm { padding: var(--sp-4); }
.card--pad-md { padding: var(--sp-6); }
.card--pad-lg { padding: var(--sp-8); }
.card--hover { cursor: pointer; }
.card--hover:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--sky-200);
  transform: translateY(-2px);
}
</style>
