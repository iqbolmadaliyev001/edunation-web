<script setup>
import Icon from './Icon.vue'
defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 48 },
  tone: { type: String, default: 'brand' }, // brand | soft | deep
})
</script>

<template>
  <span class="tile" :class="`tile--${tone}`" :style="{ width: size + 'px', height: size + 'px' }">
    <Icon :name="name" :size="size * 0.46" />
  </span>
</template>

<style scoped>
.tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-md);
  flex-shrink: 0;
}
/* To'yingan gradient faqat kichik elementda — brend qoidasi #3 */
.tile--brand {
  background: var(--grad-brand);
  color: #fff;
  box-shadow: var(--shadow-brand);
}
.tile--soft {
  background: var(--grad-brand-soft);
  color: var(--sky-700);
}
.tile--deep {
  background: var(--grad-deep);
  color: #fff;
}
</style>
