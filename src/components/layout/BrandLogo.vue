<script setup>
defineProps({
  size: { type: Number, default: 34 },
  light: { type: Boolean, default: false }, // to'q fonda oq matn
})
</script>

<template>
  <span class="logo">
    <span class="logo__mark" :style="{ width: size + 'px', height: size + 'px' }">
      <svg viewBox="0 0 24 24" :width="size * 0.62" :height="size * 0.62" fill="none"
           stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 4 2.5 9 12 14l9.5-5L12 4Z" fill="#fff" stroke="none" />
        <path d="M6 11v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" stroke="#DCEFFE" />
        <path d="M21.5 9v5.5" stroke="#fff" />
      </svg>
    </span>
    <span class="logo__text" :class="{ 'logo__text--light': light }">
      Edu<span>Nation</span>
    </span>
  </span>
</template>

<style scoped>
.logo { display: inline-flex; align-items: center; gap: 10px; }
.logo__mark {
  display: grid; place-items: center;
  border-radius: 10px;
  background: var(--grad-brand);
  box-shadow: var(--shadow-brand);
  flex-shrink: 0;
}
.logo__text {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 20px;
  letter-spacing: -0.03em;
  color: var(--ink-900);
}
.logo__text span { color: var(--sky-500); }
.logo__text--light { color: #fff; }
.logo__text--light span { color: var(--sky-300); }
</style>
