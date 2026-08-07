<script setup>
defineProps({
  w: { type: String, default: '100%' },
  h: { type: String, default: '16px' },
  radius: { type: String, default: 'var(--r-sm)' },
})
</script>

<template>
  <span class="sk" :style="{ width: w, height: h, borderRadius: radius }" />
</template>

<style scoped>
.sk {
  display: block;
  background: linear-gradient(90deg, var(--ink-100) 25%, var(--ink-50) 50%, var(--ink-100) 75%);
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
}
</style>
