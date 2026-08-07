<script setup>
import Icon from './Icon.vue'

defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  icon: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  inputmode: { type: String, default: '' },
})
defineEmits(['update:modelValue', 'enter'])
</script>

<template>
  <label class="field" :class="{ 'field--error': error }">
    <span v-if="label" class="field__label">{{ label }}</span>
    <span class="field__wrap">
      <Icon v-if="icon" :name="icon" :size="18" class="field__icon" />
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :inputmode="inputmode || undefined"
        :class="{ 'has-icon': icon }"
        @input="$emit('update:modelValue', $event.target.value)"
        @keyup.enter="$emit('enter')"
      />
    </span>
    <span v-if="error" class="field__msg field__msg--error">{{ error }}</span>
    <span v-else-if="hint" class="field__msg">{{ hint }}</span>
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
.field__icon {
  position: absolute;
  left: 13px; top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}
input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  background: var(--surface);
  color: var(--text);
  transition: border-color .16s, box-shadow .16s;
}
input.has-icon { padding-left: 40px; }
input::placeholder { color: var(--text-muted); }
input:focus { outline: none; border-color: var(--sky-400); box-shadow: var(--focus-ring); }
input:disabled { background: var(--ink-50); cursor: not-allowed; }

.field--error input { border-color: var(--danger-500); }
.field__msg { display: block; margin-top: 6px; font-size: 12.5px; color: var(--text-muted); }
.field__msg--error { color: var(--danger-500); }
</style>
