<script setup>
import Icon from './Icon.vue'
defineProps({
  tone: { type: String, default: 'neutral' }, // neutral | brand | success | warning | danger | gold
  icon: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md
})
</script>

<template>
  <span class="badge" :class="[`badge--${tone}`, `badge--${size}`]">
    <Icon v-if="icon" :name="icon" :size="size === 'sm' ? 12 : 14" />
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  font-size: 12.5px;
  line-height: 1;
  padding: 5px 10px;
  border-radius: var(--r-full);
  white-space: nowrap;
}
.badge--sm { font-size: 11px; padding: 4px 8px; }

.badge--neutral { background: var(--ink-100); color: var(--ink-600); }
.badge--brand { background: var(--sky-100); color: var(--sky-700); }
.badge--success { background: var(--success-50); color: var(--success-500); }
.badge--warning { background: var(--warning-50); color: #9a6f0a; }
.badge--danger { background: var(--danger-50); color: var(--danger-500); }
.badge--gold { background: #FBF0D6; color: #9a6f0a; }
</style>
