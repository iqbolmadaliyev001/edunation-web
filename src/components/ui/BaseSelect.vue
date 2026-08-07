<script setup>
import Icon from './Icon.vue'

defineProps({
  modelValue: { type: [String, Number, null], default: '' },
  label: { type: String, default: '' },
  options: { type: Array, default: () => [] }, // [{value,label}]
  placeholder: { type: String, default: 'Tanlang' },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="field">
    <span v-if="label" class="field__label">{{ label }}</span>
    <span class="field__wrap">
      <select
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option value="">{{ placeholder }}</option>
        <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
      <Icon name="chevron-down" :size="18" class="field__chev" />
    </span>
  </label>
</template>

<style scoped>
.field { display: block; }
.field__label {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-soft);
  margin-bottom: 7px;
}
.field__wrap { position: relative; display: block; }
select {
  width: 100%;
  height: 46px;
  padding: 0 40px 0 14px;
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  background: var(--surface);
  color: var(--text);
  appearance: none;
  cursor: pointer;
  transition: border-color .16s, box-shadow .16s;
}
select:focus { outline: none; border-color: var(--sky-400); box-shadow: var(--focus-ring); }
.field__chev {
  position: absolute;
  right: 13px; top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}
</style>
