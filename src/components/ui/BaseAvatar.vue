<script setup>
import { computed } from 'vue'
import { initials } from '@/lib/format'

const props = defineProps({
  src: { type: String, default: '' },
  name: { type: String, default: '' },
  size: { type: Number, default: 40 },
  square: { type: Boolean, default: false },
})
const label = computed(() => initials(props.name) || '?')
</script>

<template>
  <div
    class="avatar"
    :class="{ 'avatar--square': square }"
    :style="{ width: size + 'px', height: size + 'px', fontSize: size * 0.38 + 'px' }"
  >
    <img v-if="src" :src="src" :alt="name" loading="lazy" />
    <span v-else>{{ label }}</span>
  </div>
</template>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-full);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--grad-brand-soft);
  color: var(--sky-700);
  font-weight: 700;
  letter-spacing: -0.02em;
  border: 1px solid var(--sky-100);
}
.avatar--square { border-radius: var(--r-md); }
.avatar img { width: 100%; height: 100%; object-fit: cover; }
</style>
