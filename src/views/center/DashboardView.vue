<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { analyticsApi } from '@/api'
import { useCenterStore } from '@/stores/center'
import { compact, money } from '@/lib/format'
import PageHeader from '@/components/panel/PageHeader.vue'
import MetricCard from '@/components/panel/MetricCard.vue'
import MiniChart from '@/components/charts/MiniChart.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Icon from '@/components/ui/Icon.vue'

const centerStore = useCenterStore()
const data = ref(null)
const loading = ref(true)
const days = ref('30')

const periodOptions = [
  { value: '7', label: 'So\'nggi 7 kun' },
  { value: '30', label: 'So\'nggi 30 kun' },
  { value: '90', label: 'So\'nggi 90 kun' },
]

const pipelineMax = computed(() => {
  const p = data.value?.pipeline || []
  return Math.max(1, ...p.map((x) => x.count))
})
const collectRate = computed(() => {
  const f = data.value?.finance
  if (!f || !f.expected) return 0
  return Math.round((f.collected / f.expected) * 100)
})

async function load() {
  if (!centerStore.active) return
  loading.value = true
  try {
    data.value = await analyticsApi.centerDashboard({ center: centerStore.active.id, days: days.value })
  } finally {
    loading.value = false
  }
}

watch(() => centerStore.active?.id, load)
watch(days, load)
onMounted(async () => {
  await centerStore.load()
  load()
})
</script>

<template>
  <div>
    <PageHeader title="Boshqaruv paneli" subtitle="Markazingizning asosiy ko'rsatkichlari bir joyda">
      <template #actions>
        <div style="width: 190px">
          <BaseSelect v-model="days" :options="periodOptions" placeholder="Davr" />
        </div>
      </template>
    </PageHeader>

    <BaseSpinner v-if="loading && !data" center />

    <EmptyState
      v-else-if="!centerStore.hasCenter"
      icon="building"
      title="Sizda hali markaz yo'q"
      text="Markaz qo'shish uchun qo'llab-quvvatlash xizmatiga murojaat qiling."
    />

    <template v-else-if="data">
      <!-- Metrikalar -->
      <div class="grid cols-4 metrics">
        <MetricCard label="Profil ko'rishlari" :value="compact(data.metrics.views.value)"
                    icon="eye" :change="data.metrics.views.change_percent" />
        <MetricCard label="Yangi lidlar" :value="data.metrics.leads.value"
                    icon="briefcase" :change="data.metrics.leads.change_percent" />
        <MetricCard label="Yangi o'quvchilar" :value="data.metrics.new_students.value"
                    icon="graduation-cap" :change="data.metrics.new_students.change_percent" />
        <MetricCard label="Faol o'quvchilar" :value="compact(data.metrics.active_students.value)"
                    icon="users" />
      </div>

      <!-- Grafiklar -->
      <div class="grid cols-2 charts">
        <div class="panel">
          <div class="panel__head">
            <h3>Profil ko'rishlari dinamikasi</h3>
            <span class="panel__total tabular">{{ compact(data.metrics.views.value) }}</span>
          </div>
          <MiniChart :data="data.charts.views" type="area" :height="120" />
        </div>
        <div class="panel">
          <div class="panel__head">
            <h3>Kunlik lidlar</h3>
            <span class="panel__total tabular">{{ data.metrics.leads.value }}</span>
          </div>
          <MiniChart :data="data.charts.leads" type="bar" :height="120" />
        </div>
      </div>

      <div class="grid cols-2 bottom">
        <!-- CRM voronkasi -->
        <div class="panel">
          <div class="panel__head"><h3>Sotuv voronkasi</h3></div>
          <div class="funnel">
            <div v-for="s in data.pipeline" :key="s.stage" class="funnel__row">
              <span class="funnel__label">{{ s.label }}</span>
              <span class="funnel__track">
                <span class="funnel__fill" :style="{ width: (s.count / pipelineMax * 100) + '%' }" />
              </span>
              <span class="funnel__count tabular">{{ s.count }}</span>
            </div>
          </div>
        </div>

        <!-- Moliya + sharhlar -->
        <div class="stack">
          <div class="panel">
            <div class="panel__head">
              <h3>Bu oy to'lovlari</h3>
              <span class="finance-rate" :class="{ good: collectRate >= 75 }">{{ collectRate }}% yig'ildi</span>
            </div>
            <div class="finance">
              <div class="finance__bar">
                <span class="finance__bar-fill" :style="{ width: collectRate + '%' }" />
              </div>
              <div class="finance__rows">
                <div class="finance__row">
                  <span><i class="dot dot--paid"></i> Yig'ilgan</span>
                  <b class="tabular">{{ money(data.finance.collected, { short: true }) }}</b>
                </div>
                <div class="finance__row">
                  <span><i class="dot dot--due"></i> Qarzdorlik</span>
                  <b class="tabular">{{ money(data.finance.outstanding, { short: true }) }}</b>
                </div>
              </div>
            </div>
          </div>

          <div class="panel reviews-mini">
            <div class="reviews-mini__score">
              <div class="reviews-mini__num tabular">{{ data.reviews.average.toFixed(1) }}</div>
              <Icon name="star" :size="18" class="gold" />
            </div>
            <div class="reviews-mini__info">
              <div class="reviews-mini__total">{{ data.reviews.total }} ta sharh</div>
              <div v-if="data.reviews.unanswered" class="reviews-mini__pending">
                <Icon name="bell" :size="13" /> {{ data.reviews.unanswered }} javobsiz
              </div>
              <div v-else class="reviews-mini__ok"><Icon name="check-circle" :size="13" /> Barchasi javoblangan</div>
            </div>
            <RouterLink :to="{ name: 'center-reviews' }" class="reviews-mini__link">
              <Icon name="arrow-right" :size="18" />
            </RouterLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.metrics { margin-bottom: var(--sp-5); }
.charts { margin-bottom: var(--sp-5); }
.bottom { align-items: start; }

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--sp-5);
  box-shadow: var(--shadow-sm);
}
.panel__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--sp-4); }
.panel__head h3 { font-size: 16px; }
.panel__total { font-family: var(--font-display); font-weight: 800; font-size: 20px; color: var(--sky-600); }

.funnel { display: flex; flex-direction: column; gap: 12px; }
.funnel__row { display: flex; align-items: center; gap: 12px; }
.funnel__label { width: 110px; font-size: 13.5px; font-weight: 600; color: var(--text-soft); flex-shrink: 0; }
.funnel__track { flex: 1; height: 26px; background: var(--ink-50); border-radius: var(--r-sm); overflow: hidden; }
.funnel__fill { display: block; height: 100%; background: var(--grad-brand); border-radius: var(--r-sm); min-width: 2px; transition: width .4s; }
.funnel__count { width: 36px; text-align: right; font-weight: 700; color: var(--text); }

.stack { display: flex; flex-direction: column; gap: var(--sp-5); }
.finance-rate { font-size: 13px; font-weight: 700; color: var(--warning-500); }
.finance-rate.good { color: var(--success-500); }
.finance__bar { height: 10px; background: var(--ink-100); border-radius: 999px; overflow: hidden; margin-bottom: var(--sp-4); }
.finance__bar-fill { display: block; height: 100%; background: linear-gradient(90deg, var(--success-500), #34C79A); border-radius: 999px; }
.finance__rows { display: flex; flex-direction: column; gap: 10px; }
.finance__row { display: flex; align-items: center; justify-content: space-between; font-size: 14px; color: var(--text-soft); }
.dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 7px; }
.dot--paid { background: var(--success-500); }
.dot--due { background: var(--warning-500); }

.reviews-mini { display: flex; align-items: center; gap: var(--sp-4); }
.reviews-mini__score { display: flex; align-items: center; gap: 6px; }
.reviews-mini__num { font-family: var(--font-display); font-weight: 800; font-size: 34px; color: var(--ink-800); }
.gold { color: var(--gold-500); fill: var(--gold-500); }
.reviews-mini__info { flex: 1; }
.reviews-mini__total { font-weight: 700; }
.reviews-mini__pending { font-size: 12.5px; color: var(--warning-500); display: inline-flex; align-items: center; gap: 4px; margin-top: 2px; }
.reviews-mini__ok { font-size: 12.5px; color: var(--success-500); display: inline-flex; align-items: center; gap: 4px; margin-top: 2px; }
.reviews-mini__link { width: 38px; height: 38px; display: grid; place-items: center; border-radius: var(--r-sm); background: var(--sky-50); color: var(--sky-600); }
</style>
