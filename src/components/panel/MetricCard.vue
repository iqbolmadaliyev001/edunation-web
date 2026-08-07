<script setup>
import Icon from '@/components/ui/Icon.vue'

defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, default: 'chart' },
  change: { type: [Number, null], default: null },
  suffix: { type: String, default: '' },
})
</script>

<template>
  <div class="mc">
    <div class="mc__head">
      <span class="mc__icon"><Icon :name="icon" :size="18" /></span>
      <span
        v-if="change !== null && change !== undefined"
        class="mc__change"
        :class="change >= 0 ? 'up' : 'down'"
      >
        <Icon :name="change >= 0 ? 'trending-up' : 'chevron-down'" :size="13" />
        {{ Math.abs(change) }}%
      </span>
    </div>
    <div class="mc__value tabular">{{ value }}<span v-if="suffix" class="mc__suffix">{{ suffix }}</span></div>
    <div class="mc__label">{{ label }}</div>
  </div>
</template>

<style scoped>
.mc {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--sp-5);
  box-shadow: var(--shadow-sm);
}
.mc__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--sp-4); }
.mc__icon {
  width: 40px; height: 40px; display: grid; place-items: center;
  border-radius: var(--r-sm);
  background: var(--grad-brand-soft); color: var(--sky-600);
}
.mc__change { display: inline-flex; align-items: center; gap: 2px; font-size: 12.5px; font-weight: 700; padding: 3px 8px; border-radius: var(--r-full); }
.mc__change.up { background: var(--success-50); color: var(--success-500); }
.mc__change.down { background: var(--danger-50); color: var(--danger-500); }
.mc__value { font-family: var(--font-display); font-weight: 800; font-size: 30px; letter-spacing: -0.02em; color: var(--text); line-height: 1; }
.mc__suffix { font-size: 15px; font-weight: 600; color: var(--text-muted); margin-left: 4px; }
.mc__label { color: var(--text-muted); font-size: 13.5px; margin-top: 8px; }
</style>
