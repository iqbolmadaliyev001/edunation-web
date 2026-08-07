<script setup>
import { RouterLink } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'

defineProps({
  direction: { type: Object, required: true },
})

// Backend `icon` kaliti bizning ikonka to'plamiga moslanadi
const iconMap = {
  language: 'language',
  code: 'code',
  calculator: 'calculator',
  book: 'book-open',
  award: 'award',
  palette: 'palette',
  globe: 'globe',
}
</script>

<template>
  <RouterLink :to="{ name: 'centers', query: { direction: direction.id } }" class="dc">
    <span class="dc__icon" :style="{ '--accent': direction.color || 'var(--sky-500)' }">
      <Icon :name="iconMap[direction.icon] || 'book-open'" :size="24" />
    </span>
    <div class="dc__text">
      <h4 class="dc__name">{{ direction.name_uz }}</h4>
      <p class="dc__count">{{ direction.centers_count ?? '' }} <span v-if="direction.centers_count != null">markaz</span></p>
    </div>
    <Icon name="arrow-up-right" :size="18" class="dc__arrow" />
  </RouterLink>
</template>

<style scoped>
.dc {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-4);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-xs);
  transition: box-shadow .18s, border-color .18s, transform .18s;
}
.dc:hover { box-shadow: var(--shadow-md); border-color: var(--sky-200); transform: translateY(-2px); }
.dc:hover .dc__arrow { color: var(--sky-500); transform: translate(2px, -2px); }

.dc__icon {
  width: 52px; height: 52px;
  display: grid; place-items: center;
  border-radius: var(--r-md);
  flex-shrink: 0;
  color: #fff;
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 78%, #1272C4), var(--accent));
  box-shadow: 0 6px 16px color-mix(in srgb, var(--accent) 32%, transparent);
}
.dc__text { flex: 1; min-width: 0; }
.dc__name {
  font-size: 15.5px; font-weight: 700;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dc__count { font-size: 12.5px; color: var(--text-muted); }
.dc__arrow { color: var(--ink-300); transition: transform .18s, color .18s; }
</style>
