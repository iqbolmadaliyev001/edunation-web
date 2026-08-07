<script setup>
import { onMounted, ref } from 'vue'
import { centersApi, reviewsApi } from '@/api'
import PanelShell from '@/components/layout/PanelShell.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import Icon from '@/components/ui/Icon.vue'

/**
 * Platforma admin paneli.
 *
 * Yon menyudagi badge'lar — moderatorning navbati. Markaz yoki sharh
 * kutib qolsa, admin uni ochmasdan ham ko'radi.
 */
const nav = ref([
  { name: 'admin-dashboard', label: 'Umumiy holat', icon: 'chart', exact: true },
  { name: 'admin-centers', label: 'Markazlar', icon: 'building' },
  { name: 'admin-reviews', label: 'Sharhlar', icon: 'star' },
  { name: 'admin-users', label: 'Foydalanuvchilar', icon: 'users' },
  { name: 'admin-catalog', label: 'Katalog', icon: 'map-pin' },
])

async function loadQueueCounts() {
  const [centers, reviews] = await Promise.allSettled([
    centersApi.pending({ page_size: 1 }),
    reviewsApi.pending({ page_size: 1 }),
  ])
  if (centers.status === 'fulfilled') setBadge('admin-centers', centers.value.count)
  if (reviews.status === 'fulfilled') setBadge('admin-reviews', reviews.value.count)
}

function setBadge(name, count) {
  const item = nav.value.find((n) => n.name === name)
  if (item) item.badge = count || undefined
}

onMounted(loadQueueCounts)
</script>

<template>
  <PanelShell :nav="nav" accent="Platforma boshqaruvi">
    <template #topbar>
      <div class="admin-badge">
        <span class="admin-badge__mark"><Icon name="shield" :size="18" /></span>
        <div>
          <div class="admin-badge__title">EduNation administratori</div>
          <div class="admin-badge__meta">Butun platforma bo'yicha to'liq kirish</div>
        </div>
        <BaseBadge tone="brand" size="sm">Admin</BaseBadge>
      </div>
    </template>
  </PanelShell>
</template>

<style scoped>
.admin-badge { display: flex; align-items: center; gap: 12px; }
.admin-badge__mark {
  width: 40px; height: 40px; border-radius: var(--r-md);
  background: var(--grad-brand); color: #fff;
  display: grid; place-items: center; flex-shrink: 0;
  box-shadow: var(--shadow-brand);
}
.admin-badge__title { font-weight: 700; font-size: 15px; line-height: 1.1; }
.admin-badge__meta { font-size: 12.5px; color: var(--text-muted); }

@media (max-width: 700px) {
  .admin-badge__meta { display: none; }
}
</style>
