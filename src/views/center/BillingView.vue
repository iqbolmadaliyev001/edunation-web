<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { billingApi } from '@/api'
import { useCenterStore } from '@/stores/center'
import { money, dateFull } from '@/lib/format'
import PageHeader from '@/components/panel/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import Icon from '@/components/ui/Icon.vue'

const centerStore = useCenterStore()
const subscription = ref(null)
const invoices = ref([])
const plans = ref([])
const loading = ref(true)

const INV_STATUS = {
  paid: { label: "To'langan", tone: 'success' },
  pending: { label: 'Kutilmoqda', tone: 'warning' },
  overdue: { label: 'Muddati o\'tgan', tone: 'danger' },
  cancelled: { label: 'Bekor qilingan', tone: 'neutral' },
}

async function load() {
  if (!centerStore.active) return
  loading.value = true
  try {
    const [subs, inv, pl] = await Promise.all([
      billingApi.subscriptions({ center: centerStore.active.id }).then((r) => r.results || r).catch(() => []),
      billingApi.invoices({ center: centerStore.active.id, page_size: 12 }).then((r) => r.results || r).catch(() => []),
      billingApi.plans().then((r) => r.results || r).catch(() => []),
    ])
    subscription.value = subs[0] || null
    invoices.value = inv
    plans.value = pl.filter((p) => p.is_active)
  } finally {
    loading.value = false
  }
}

watch(() => centerStore.active?.id, load)
onMounted(async () => {
  await centerStore.load()
  load()
})
</script>

<template>
  <div>
    <PageHeader title="Obuna va to'lovlar" subtitle="Tarifingiz, hisob-fakturalar va to'lov tarixi" />

    <BaseSpinner v-if="loading" center />

    <template v-else>
      <!-- Joriy obuna -->
      <div v-if="subscription" class="current">
        <div class="current__glow"></div>
        <div class="current__inner">
          <div>
            <span class="current__label">Joriy tarif</span>
            <div class="current__plan">{{ subscription.plan_detail?.name || 'Tarif' }}</div>
            <div class="current__price tabular">
              {{ money(subscription.plan_detail?.price, { short: true }) }}
              <span v-if="Number(subscription.plan_detail?.price)">/oy</span>
            </div>
          </div>
          <div class="current__right">
            <BaseBadge :tone="subscription.is_usable ? 'success' : 'danger'">
              {{ subscription.is_usable ? 'Faol' : 'Muddati tugagan' }}
            </BaseBadge>
            <div class="current__days">
              <Icon name="clock" :size="14" />
              {{ subscription.days_left > 0 ? `${subscription.days_left} kun qoldi` : 'Yangilash kerak' }}
            </div>
            <div class="current__until muted">{{ dateFull(subscription.current_period_end) }}gacha</div>
          </div>
        </div>
      </div>

      <!-- Tariflar -->
      <h3 class="sec-title">Tariflar</h3>
      <div class="grid cols-4 plans">
        <div v-for="p in plans" :key="p.id" class="plan"
             :class="{ 'plan--current': subscription?.plan === p.id }">
          <div class="plan__name">{{ p.name }}</div>
          <div class="plan__price tabular">{{ money(p.price, { short: true }) }}</div>
          <div class="plan__limits">
            <span><Icon name="book-open" :size="13" /> {{ p.max_courses || '∞' }} kurs</span>
            <span><Icon name="users" :size="13" /> {{ p.max_students || '∞' }} o'quvchi</span>
            <span v-if="p.has_analytics"><Icon name="chart" :size="13" /> Analitika</span>
            <span v-if="p.has_featured_slot"><Icon name="sparkles" :size="13" /> Premium joy</span>
          </div>
          <BaseButton
            :variant="subscription?.plan === p.id ? 'secondary' : 'soft'"
            size="sm" block :disabled="subscription?.plan === p.id"
          >
            {{ subscription?.plan === p.id ? 'Joriy tarif' : 'Tanlash' }}
          </BaseButton>
        </div>
      </div>

      <!-- Hisob-fakturalar -->
      <h3 class="sec-title">Hisob-fakturalar</h3>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr><th>Raqam</th><th>Davr</th><th>Summa</th><th>Muddat</th><th>Holat</th></tr>
          </thead>
          <tbody>
            <tr v-for="inv in invoices" :key="inv.id">
              <td class="mono">{{ inv.number || '#' + inv.id }}</td>
              <td class="muted">{{ dateFull(inv.period_start) }}</td>
              <td class="tabular"><b>{{ money(inv.total) }}</b></td>
              <td class="muted">{{ dateFull(inv.due_date) }}</td>
              <td><BaseBadge :tone="INV_STATUS[inv.status]?.tone || 'neutral'" size="sm">{{ INV_STATUS[inv.status]?.label || inv.status }}</BaseBadge></td>
            </tr>
            <tr v-if="!invoices.length"><td colspan="5" class="empty">Hisob-fakturalar yo'q</td></tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
.current { position: relative; border-radius: var(--r-xl); background: var(--grad-deep); overflow: hidden; box-shadow: var(--shadow-md); margin-bottom: var(--sp-8); }
.current__glow { position: absolute; inset: 0; background: radial-gradient(50% 90% at 80% 10%, rgba(76,172,244,.4), transparent 60%); }
.current__inner { position: relative; display: flex; align-items: center; justify-content: space-between; gap: var(--sp-6); padding: var(--sp-8); }
.current__label { color: var(--sky-200); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
.current__plan { color: #fff; font-family: var(--font-display); font-weight: 800; font-size: 30px; margin-top: 6px; }
.current__price { color: var(--sky-100); font-size: 18px; margin-top: 4px; }
.current__right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.current__days { color: #fff; font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; }
.current__until { color: var(--sky-200) !important; font-size: 13px; }

.sec-title { font-size: 18px; margin: var(--sp-8) 0 var(--sp-4); }
.plans { margin-bottom: var(--sp-4); }
.plan { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--sp-5); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 10px; }
.plan--current { border-color: var(--sky-300); box-shadow: var(--shadow-md); }
.plan__name { font-weight: 700; font-size: 16px; }
.plan__price { font-family: var(--font-display); font-weight: 800; font-size: 22px; color: var(--ink-800); }
.plan__limits { display: flex; flex-direction: column; gap: 6px; flex: 1; margin-bottom: 6px; }
.plan__limits span { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-soft); }

.table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); box-shadow: var(--shadow-sm); overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; min-width: 560px; }
.table th { text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-muted); padding: 13px 16px; border-bottom: 1px solid var(--border); background: var(--surface-2); }
.table td { padding: 13px 16px; border-bottom: 1px solid var(--border); font-size: 14px; }
.table tbody tr:last-child td { border-bottom: none; }
.mono { font-family: ui-monospace, monospace; font-size: 13px; }
.muted { color: var(--text-soft); }
.empty { text-align: center; color: var(--text-muted); padding: var(--sp-8); }
</style>
