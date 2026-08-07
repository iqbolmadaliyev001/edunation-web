<script setup>
import { computed } from 'vue'

/**
 * Yengil SVG grafik — tashqi kutubxonasiz.
 * type: 'area' (kunlik dinamika) yoki 'bar' (taqsimot).
 * data: [{date|label, value}]
 */
const props = defineProps({
  data: { type: Array, default: () => [] },
  type: { type: String, default: 'area' },
  height: { type: Number, default: 64 },
})

const W = 300
const H = computed(() => props.height)
const PAD = 4

const values = computed(() => props.data.map((d) => Number(d.value) || 0))
const max = computed(() => Math.max(1, ...values.value))

const points = computed(() => {
  const n = values.value.length
  if (n === 0) return ''
  const step = n > 1 ? (W - PAD * 2) / (n - 1) : 0
  return values.value
    .map((v, i) => {
      const x = PAD + i * step
      const y = H.value - PAD - (v / max.value) * (H.value - PAD * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})

const areaPath = computed(() => {
  if (!points.value) return ''
  const pts = points.value.split(' ')
  const first = pts[0].split(',')[0]
  const last = pts[pts.length - 1].split(',')[0]
  return `M ${first},${H.value - PAD} L ${pts.join(' L ')} L ${last},${H.value - PAD} Z`
})

const bars = computed(() => {
  const n = values.value.length
  if (!n) return []
  const gap = 5
  const bw = (W - PAD * 2 - gap * (n - 1)) / n
  return values.value.map((v, i) => ({
    x: PAD + i * (bw + gap),
    y: H.value - PAD - (v / max.value) * (H.value - PAD * 2),
    w: bw,
    h: (v / max.value) * (H.value - PAD * 2),
  }))
})
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" class="mc" :style="{ height: H + 'px' }">
    <defs>
      <linearGradient id="mc-area" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--sky-400)" stop-opacity="0.28" />
        <stop offset="100%" stop-color="var(--sky-400)" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="mc-bar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--sky-400)" />
        <stop offset="100%" stop-color="var(--sky-600)" />
      </linearGradient>
    </defs>

    <template v-if="type === 'area'">
      <path :d="areaPath" fill="url(#mc-area)" />
      <polyline :points="points" fill="none" stroke="var(--sky-500)" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
    </template>

    <template v-else>
      <rect v-for="(b, i) in bars" :key="i" :x="b.x" :y="b.y" :width="b.w" :height="Math.max(b.h, 1)"
            rx="2" fill="url(#mc-bar)" />
    </template>
  </svg>
</template>

<style scoped>
.mc { width: 100%; display: block; overflow: visible; }
</style>
