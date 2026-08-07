<script setup>
import { onMounted, computed } from 'vue'
import { useCenterStore } from '@/stores/center'
import PanelShell from '@/components/layout/PanelShell.vue'
import Icon from '@/components/ui/Icon.vue'

const centerStore = useCenterStore()

const nav = [
  { name: 'center-dashboard', label: 'Boshqaruv', icon: 'chart', exact: true },
  { name: 'center-leads', label: 'Lidlar (CRM)', icon: 'briefcase' },
  { name: 'center-courses', label: 'Kurslar', icon: 'book-open' },
  { name: 'center-groups', label: 'Guruhlar', icon: 'users' },
  { name: 'center-teachers', label: "O'qituvchilar", icon: 'graduation-cap' },
  { name: 'center-reviews', label: 'Sharhlar', icon: 'star' },
  { name: 'center-billing', label: 'Obuna', icon: 'credit-card' },
  { name: 'center-settings', label: 'Sozlamalar', icon: 'settings' },
]

const active = computed(() => centerStore.active)

onMounted(() => centerStore.load())
</script>

<template>
  <PanelShell :nav="nav" accent="Markaz paneli">
    <template #topbar>
      <div v-if="active" class="center-badge">
        <span class="center-badge__logo">
          <img v-if="active.logo" :src="active.logo" :alt="active.name" />
          <Icon v-else name="building" :size="18" />
        </span>
        <div>
          <div class="center-badge__name">{{ active.name }}</div>
          <div class="center-badge__meta">
            <Icon name="star" :size="12" class="gold" /> {{ Number(active.rating).toFixed(1) }}
            · {{ active.reviews_count }} sharh
          </div>
        </div>
      </div>
    </template>
  </PanelShell>
</template>

<style scoped>
.center-badge { display: flex; align-items: center; gap: 12px; }
.center-badge__logo {
  width: 40px; height: 40px; border-radius: var(--r-md);
  background: var(--grad-brand-soft); color: var(--sky-600);
  display: grid; place-items: center; overflow: hidden; flex-shrink: 0;
}
.center-badge__logo img { width: 100%; height: 100%; object-fit: cover; }
.center-badge__name { font-weight: 700; font-size: 15px; line-height: 1.1; }
.center-badge__meta { font-size: 12.5px; color: var(--text-muted); display: inline-flex; align-items: center; gap: 4px; }
.gold { color: var(--gold-500); fill: var(--gold-500); }
</style>
