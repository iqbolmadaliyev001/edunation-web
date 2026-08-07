<script setup>
/**
 * Yagona ikonka to'plami. Tashqi kutubxona yo'q — SVG path'lar shu yerda,
 * shunda brendga aniq mos keladi va hajm minimal.
 * Barchasi 24×24 grid, stroke = currentColor, 1.9 qalinlik.
 */
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  stroke: { type: [Number, String], default: 1.9 },
})

const paths = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  'map-pin': '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  users: '<path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20"/><circle cx="9" cy="7.5" r="3.2"/><path d="M22 20v-1.5a4 4 0 0 0-3-3.8"/><path d="M16 4.2a3.2 3.2 0 0 1 0 6.2"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  'book-open': '<path d="M12 6.5C10.5 5.3 8.3 4.8 4 5v13c4.3-.2 6.5.3 8 1.5 1.5-1.2 3.7-1.7 8-1.5V5c-4.3-.2-6.5.3-8 1.5Z"/><path d="M12 6.5V19.5"/>',
  'graduation-cap': '<path d="M12 4 2.5 9 12 14l9.5-5L12 4Z"/><path d="M6 11v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/><path d="M21.5 9v5.5"/>',
  'trending-up': '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  'chart': '<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6" rx="1"/><rect x="12" y="8" width="3" height="10" rx="1"/><rect x="17" y="4" width="3" height="14" rx="1"/>',
  'pie': '<path d="M12 3a9 9 0 1 0 9 9h-9V3Z"/><path d="M14 3.2A7 7 0 0 1 20.8 10H14V3.2Z"/>',
  briefcase: '<rect x="3" y="7.5" width="18" height="12" rx="2.5"/><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5"/><path d="M3 12.5h18"/>',
  'credit-card': '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 9.5h18"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  'check': '<path d="M5 12.5 10 17.5 19.5 7"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5 11 15l4.5-5.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  'x-circle': '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  'chevron-right': '<path d="m9 6 6 6-6 6"/>',
  'chevron-left': '<path d="m15 6-6 6 6 6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
  phone: '<path d="M4 5c0-1 1-2 2-2h2l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5V20c0 1-1 2-2 2A17 17 0 0 1 4 5Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18"/>',
  send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z"/>',
  filter: '<path d="M3 5h18l-7 8v5l-4 2v-7L3 5Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  award: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5 7 21l5-2.5L17 21l-1.5-7.5"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1"/>',
  shield: '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z"/><path d="M9 12l2 2 4-4"/>',
  sparkles: '<path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4Z"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z"/>',
  'log-out': '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5M5 12h11"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5 3.6 3.6M20.4 20.4 19 19M5 19l-1.4 1.4M20.4 3.6 19 5"/>',
  moon: '<path d="M20 13.5A8 8 0 1 1 10.5 4 6.3 6.3 0 0 0 20 13.5Z"/>',
  code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 6l-2 12"/>',
  language: '<path d="M4 5h9M8.5 5c0 5-2.5 9-5.5 11M6 9c0 3 2.5 5.5 6 6.5"/><path d="m13 20 4-9 4 9M14.5 17h5"/>',
  calculator: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h4"/>',
  palette: '<path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2s-.8-1.5-.8-2.4c0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16.5" cy="10.5" r="1"/>',
  heart: '<path d="M12 20s-7-4.5-9.2-9C1.3 8 3 4.5 6.5 4.5c2 0 3.5 1.5 5.5 3.5 2-2 3.5-3.5 5.5-3.5C21 4.5 22.7 8 21.2 11c-2.2 4.5-9.2 9-9.2 9Z"/>',
  'thumbs-up': '<path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Z"/><path d="M7 11l4.5-7c1 0 2 .8 2 2v3h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 17.3 20H7"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  edit: '<path d="M4 20h4L18.5 9.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z"/><path d="M13.5 6.5l3 3"/>',
  trash: '<path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/>',
  'building': '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3"/>',
  logo: '<path d="M12 4 2.5 9 12 14l9.5-5L12 4Z"/><path d="M6 11v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/><path d="M21.5 9v5.5"/>',
}

const inner = computed(() => paths[props.name] || paths.sparkles)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke-width="stroke"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="icon"
    aria-hidden="true"
    v-html="inner"
  />
</template>

<style scoped>
.icon {
  flex-shrink: 0;
  display: inline-block;
  vertical-align: middle;
}
</style>
