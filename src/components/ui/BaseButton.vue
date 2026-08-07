<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost | danger | soft
  size: { type: String, default: 'md' }, // sm | md | lg
  icon: { type: String, default: '' },
  iconRight: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const classes = computed(() => [
  'btn',
  `btn--${props.variant}`,
  `btn--${props.size}`,
  { 'btn--block': props.block, 'btn--loading': props.loading },
])
</script>

<template>
  <button :class="classes" :disabled="disabled || loading">
    <span v-if="loading" class="btn__spinner" />
    <Icon v-else-if="icon" :name="icon" :size="size === 'sm' ? 16 : 18" />
    <span v-if="$slots.default" class="btn__label"><slot /></span>
    <Icon v-if="iconRight && !loading" :name="iconRight" :size="size === 'sm' ? 16 : 18" />
  </button>
</template>

<style scoped>
.btn {
  --h: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  height: var(--h);
  padding-inline: var(--sp-5);
  border-radius: var(--r-md);
  font-weight: 600;
  font-size: 15px;
  letter-spacing: -0.01em;
  white-space: nowrap;
  transition: transform .12s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease;
  user-select: none;
}
.btn:disabled { opacity: .55; cursor: not-allowed; }
.btn:not(:disabled):hover { transform: translateY(-1px); }
.btn:not(:disabled):active { transform: translateY(0); }

.btn--sm { --h: 36px; font-size: 14px; padding-inline: var(--sp-3); border-radius: var(--r-sm); }
.btn--lg { --h: 52px; font-size: 16px; padding-inline: var(--sp-6); }
.btn--block { width: 100%; }

/* Primary — brend gradient + brend soya */
.btn--primary {
  background: var(--grad-brand);
  color: #fff;
  box-shadow: var(--shadow-brand), var(--shadow-inset);
}
.btn--primary:not(:disabled):hover { box-shadow: 0 12px 30px rgba(36,144,230,.36), var(--shadow-inset); }

/* Secondary — oq fon, chegara */
.btn--secondary {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow-xs);
}
.btn--secondary:not(:disabled):hover { border-color: var(--sky-300); box-shadow: var(--shadow-sm); }

/* Soft — yumshoq havorang fon */
.btn--soft {
  background: var(--grad-brand-soft);
  color: var(--sky-700);
}
.btn--soft:not(:disabled):hover { box-shadow: var(--shadow-sm); }

/* Ghost */
.btn--ghost { background: transparent; color: var(--text-soft); }
.btn--ghost:not(:disabled):hover { background: var(--sky-50); color: var(--sky-700); }

/* Danger */
.btn--danger { background: var(--danger-500); color: #fff; box-shadow: 0 8px 20px rgba(220,75,75,.25); }

.btn__spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
.btn--secondary .btn__spinner,
.btn--ghost .btn__spinner,
.btn--soft .btn__spinner { border-color: var(--sky-200); border-top-color: var(--sky-600); }
</style>
