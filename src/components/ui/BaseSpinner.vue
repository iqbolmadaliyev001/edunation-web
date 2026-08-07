<script setup>
defineProps({ size: { type: Number, default: 28 }, center: { type: Boolean, default: false } })
</script>

<template>
  <div :class="{ 'spin-center': center }">
    <span class="spinner" :style="{ width: size + 'px', height: size + 'px' }" />
  </div>
</template>

<style scoped>
.spin-center { display: grid; place-items: center; padding: var(--sp-12) 0; }
.spinner {
  display: inline-block;
  border: 3px solid var(--sky-100);
  border-top-color: var(--sky-500);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
</style>
