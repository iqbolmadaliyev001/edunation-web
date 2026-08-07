<script setup>
import Icon from './Icon.vue'
defineProps({
  value: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  icon: { type: String, default: '' },
  change: { type: [Number, null], default: null }, // foizli o'zgarish
})
</script>

<template>
  <div class="stat">
    <div v-if="icon" class="stat__icon"><Icon :name="icon" :size="18" /></div>
    <div class="stat__body">
      <div class="stat__value tabular">
        {{ value }}
        <span
          v-if="change !== null && change !== undefined"
          class="stat__change"
          :class="change >= 0 ? 'up' : 'down'"
        >
          <Icon :name="change >= 0 ? 'trending-up' : 'chevron-down'" :size="13" />
          {{ Math.abs(change) }}%
        </span>
      </div>
      <div class="stat__label">{{ label }}</div>
    </div>
  </div>
</template>

<style scoped>
.stat {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.stat__icon {
  width: 40px; height: 40px;
  display: grid; place-items: center;
  border-radius: var(--r-sm);
  background: var(--grad-brand-soft);
  color: var(--sky-600);
  flex-shrink: 0;
}
.stat__value {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 24px;
  letter-spacing: -0.02em;
  color: var(--text);
  display: flex;
  align-items: baseline;
  gap: 8px;
  line-height: 1.1;
}
.stat__change {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
}
.stat__change.up { color: var(--success-500); }
.stat__change.down { color: var(--danger-500); }
.stat__label {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}
</style>
