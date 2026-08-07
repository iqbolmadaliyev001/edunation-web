<script setup>
import Icon from './Icon.vue'
defineProps({
  icon: { type: String, default: 'search' },
  title: { type: String, default: 'Ma\'lumot topilmadi' },
  text: { type: String, default: '' },
})
</script>

<template>
  <div class="empty">
    <span class="empty__icon"><Icon :name="icon" :size="26" /></span>
    <h3 class="empty__title">{{ title }}</h3>
    <p v-if="text" class="empty__text">{{ text }}</p>
    <div v-if="$slots.action" class="empty__action"><slot name="action" /></div>
  </div>
</template>

<style scoped>
.empty {
  text-align: center;
  padding: var(--sp-12) var(--sp-6);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.empty__icon {
  width: 60px; height: 60px;
  display: grid; place-items: center;
  border-radius: var(--r-lg);
  background: var(--grad-brand-soft);
  color: var(--sky-500);
  margin-bottom: var(--sp-4);
}
.empty__title { font-size: 18px; }
.empty__text { color: var(--text-muted); margin-top: var(--sp-2); max-width: 42ch; }
.empty__action { margin-top: var(--sp-5); }
</style>
