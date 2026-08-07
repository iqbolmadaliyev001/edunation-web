<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: [Number, String], default: 0 },
  size: { type: Number, default: 16 },
  interactive: { type: Boolean, default: false },
})
const emit = defineEmits(['update:value'])

const val = computed(() => Number(props.value) || 0)
function pct(i) {
  const p = val.value - (i - 1)
  return Math.max(0, Math.min(1, p)) * 100
}
</script>

<template>
  <div class="stars" :class="{ interactive }" role="img" :aria-label="`${val} / 5`">
    <button
      v-for="i in 5"
      :key="i"
      type="button"
      class="star"
      :disabled="!interactive"
      :style="{ width: size + 'px', height: size + 'px' }"
      @click="interactive && emit('update:value', i)"
    >
      <svg viewBox="0 0 24 24" :width="size" :height="size">
        <defs>
          <linearGradient :id="`fill-${i}-${val}`">
            <stop :offset="`${pct(i)}%`" stop-color="var(--gold-500)" />
            <stop :offset="`${pct(i)}%`" stop-color="var(--ink-200)" />
          </linearGradient>
        </defs>
        <path
          d="M12 3.2l2.7 5.5 6 .9-4.35 4.24 1.03 6L12 17.1 6.62 19.83l1.03-6L3.3 9.6l6-.9z"
          :fill="`url(#fill-${i}-${val})`"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.stars { display: inline-flex; gap: 2px; }
.star { padding: 0; line-height: 0; background: none; }
.interactive .star { cursor: pointer; transition: transform .12s; }
.interactive .star:hover { transform: scale(1.18); }
</style>
