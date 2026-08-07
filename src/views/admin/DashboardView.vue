<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { analyticsApi } from '@/api'
import { compact, money } from '@/lib/format'
import PageHeader from '@/components/panel/PageHeader.vue'
import MetricCard from '@/components/panel/MetricCard.vue'
import MiniChart from '@/components/charts/MiniChart.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Icon from '@/components/ui/Icon.vue'

const data = ref(null)
const loading = ref(true)
const days = ref('30')

const periodOptions = [
  { value: '7', label: "So'nggi 7 kun" },
  { value: '30', label: "So'nggi 30 kun" },
  { value: '90', label: "So'nggi 90 kun" },
]

const regionMax = computed(() =>
  Math.max(1, ...(data.value?.by_region || []).map((r) => r.count))
)

const conversionRate = computed(() => {
  const m = data.value?.metrics
  if (!m?.leads_generated?.value) return 0
  return Math.round((m.leads_converted.value / m.leads_generated.value) * 100)
})

async function load() {
  loading.value = true
  try {
    data.value = await analyticsApi.platformDashboard({ days: days.value })
  } finally {
    loading.value = false
  }
}

watch(days, load)
onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      title="Platforma holati"
      subtitle="EduNation bo'yicha umumiy o'sish va moderatsiya navbati"
    >
      <template #actions>
        <div style="width: 190px">
          <BaseSelect v-model="days" :options="periodOptions" placeholder="Davr" />
        </div>
      </template>
    </PageHeader>

    <BaseSpinner v-if="loading && !data" center />

    <template v-else-if="data">
      <!-- Moderatsiya navbati: eng birinchi ko'rinadigan narsa -->
      <div
        v-if="data.metrics.pending_centers.value || data.metrics.pending_reviews.value"
        class="queue"
      >
        <span class="queue__icon"><Icon name="bell" :size="20" /></span>
        <div class="queue__text">
          <b>Moderatsiya kutmoqda</b>
          <span>
            {{ data.metrics.pending_centers.value }} ta markaz ·
            {{ data.metrics.pending_reviews.value }} ta sharh
          </span>
        </div>
        <div class="queue__actions">
          <RouterLink
            v-if="data.metrics.pending_centers.value"
            :to="{ name: 'admin-centers' }"
            class="queue__btn"
          >
            Markazlar <Icon name="arrow-right" :size="15" />
          </RouterLink>
          <RouterLink
            v-if="data.metrics.pending_reviews.value"
            :to="{ name: 'admin-reviews' }"
            class="queue__btn"
          >
            Sharhlar <Icon name="arrow-right" :size="15" />
          </RouterLink>
        </div>
      </div>

      <!-- Asosiy metrikalar -->
      <div class="grid cols-4 metrics">
        <MetricCard
          label="Faol markazlar"
          :value="compact(data.metrics.active_centers.value)"
          icon="building"
        />
        <MetricCard
          label="Yangi markazlar"
          :value="data.metrics.new_centers.value"
          icon="plus"
          :change="data.metrics.new_centers.change_percent"
        />
        <MetricCard
          label="Foydalanuvchilar"
          :value="compact(data.metrics.total_users.value)"
          icon="users"
        />
        <MetricCard
          label="Yangi ro'yxatdan o'tish"
          :value="compact(data.metrics.new_users.value)"
          icon="user"
          :change="data.metrics.new_users.change_percent"
        />
      </div>

      <div class="grid cols-4 metrics">
        <MetricCard
          label="O'quvchilar"
          :value="compact(data.metrics.total_students.value)"
          icon="graduation-cap"
        />
        <MetricCard
          label="Yaratilgan lidlar"
          :value="compact(data.metrics.leads_generated.value)"
          icon="briefcase"
        />
        <MetricCard
          label="Konversiya"
          :value="conversionRate"
          suffix="%"
          icon="trending-up"
        />
        <MetricCard
          label="Oylik daromad (MRR)"
          :value="money(data.metrics.mrr.value, { short: true })"
          icon="credit-card"
        />
      </div>

      <!-- Ro'yxatdan o'tish dinamikasi -->
      <div class="panel chart-panel">
        <div class="panel__head">
          <h3>Ro'yxatdan o'tish dinamikasi</h3>
          <span class="panel__total tabular">+{{ compact(data.metrics.new_users.value) }}</span>
        </div>
        <MiniChart :data="data.charts.signups" type="area" :height="150" />
      </div>

      <div class="grid cols-2 bottom">
        <!-- Hududlar bo'yicha qamrov -->
        <div class="panel">
          <div class="panel__head">
            <h3>Hududlar bo'yicha qamrov</h3>
            <span class="panel__hint">faol markazlar</span>
          </div>

          <EmptyState
            v-if="!data.by_region.length"
            icon="map-pin"
            title="Ma'lumot yo'q"
            text="Hali birorta faol markaz ro'yxatga olinmagan."
          />
          <div v-else class="bars">
            <div v-for="r in data.by_region" :key="r.region" class="bars__row">
              <span class="bars__label">{{ r.region }}</span>
              <span class="bars__track">
                <span
                  class="bars__fill"
                  :style="{ width: (r.count / regionMax) * 100 + '%' }"
                />
              </span>
              <span class="bars__count tabular">{{ r.count }}</span>
            </div>
          </div>
        </div>

        <!--
          Talab bor, taklif yo'q. Bu — kengayish uchun eng qimmatli signal:
          odamlar qidiryapti, lekin natija chiqmayapti.
        -->
        <div class="panel">
          <div class="panel__head">
            <h3>Qoplanmagan talab</h3>
            <span class="panel__hint">natijasiz qidiruvlar</span>
          </div>

          <EmptyState
            v-if="!data.demand_gaps.length"
            icon="check-circle"
            title="Bo'shliq topilmadi"
            text="Barcha qidiruvlar natija bilan yakunlangan."
          />
          <ul v-else class="gaps">
            <li v-for="(g, i) in data.demand_gaps" :key="i" class="gaps__item">
              <span class="gaps__rank tabular">{{ i + 1 }}</span>
              <div class="gaps__body">
                <div class="gaps__dir">{{ g.direction }}</div>
                <div class="gaps__region">
                  <Icon name="map-pin" :size="12" /> {{ g.region }}
                </div>
              </div>
              <span class="gaps__count tabular">{{ g.searches }}</span>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.metrics { margin-bottom: var(--sp-5); }
.chart-panel { margin-bottom: var(--sp-5); }
.bottom { align-items: start; }

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--sp-5);
  box-shadow: var(--shadow-sm);
}
.panel__head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--sp-4);
}
.panel__head h3 { font-size: 16px; }
.panel__total { font-family: var(--font-display); font-weight: 800; font-size: 20px; color: var(--sky-600); }
.panel__hint { font-size: 12.5px; color: var(--text-muted); }

/* Moderatsiya navbati */
.queue {
  display: flex; align-items: center; gap: var(--sp-4);
  padding: var(--sp-4) var(--sp-5);
  margin-bottom: var(--sp-5);
  border-radius: var(--r-lg);
  background: var(--warning-50);
  border: 1px solid rgba(224, 165, 23, .28);
}
.queue__icon {
  width: 42px; height: 42px; flex-shrink: 0;
  display: grid; place-items: center;
  border-radius: var(--r-md);
  background: var(--warning-500); color: #fff;
}
.queue__text { flex: 1; display: flex; flex-direction: column; }
.queue__text b { font-size: 15px; }
.queue__text span { font-size: 13.5px; color: var(--text-soft); }
.queue__actions { display: flex; gap: var(--sp-2); flex-wrap: wrap; }
.queue__btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 8px 14px; border-radius: var(--r-sm);
  background: var(--surface); border: 1px solid var(--border-strong);
  font-size: 13.5px; font-weight: 700; color: var(--text);
  transition: border-color .15s, color .15s;
}
.queue__btn:hover { border-color: var(--sky-300); color: var(--sky-600); }

/* Gorizontal ustunlar */
.bars { display: flex; flex-direction: column; gap: 11px; }
.bars__row { display: flex; align-items: center; gap: 12px; }
.bars__label {
  width: 128px; flex-shrink: 0;
  font-size: 13.5px; font-weight: 600; color: var(--text-soft);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.bars__track { flex: 1; height: 22px; background: var(--ink-50); border-radius: var(--r-sm); overflow: hidden; }
.bars__fill {
  display: block; height: 100%; min-width: 2px;
  background: var(--grad-brand); border-radius: var(--r-sm);
  transition: width .4s var(--ease, ease);
}
.bars__count { width: 34px; text-align: right; font-weight: 700; }

/* Qoplanmagan talab */
.gaps { display: flex; flex-direction: column; gap: 2px; }
.gaps__item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 8px; border-radius: var(--r-sm);
}
.gaps__item:hover { background: var(--ink-50); }
.gaps__rank {
  width: 24px; height: 24px; flex-shrink: 0;
  display: grid; place-items: center;
  border-radius: var(--r-xs);
  background: var(--grad-brand-soft); color: var(--sky-700);
  font-size: 12px; font-weight: 700;
}
.gaps__body { flex: 1; min-width: 0; }
.gaps__dir { font-size: 14px; font-weight: 600; }
.gaps__region {
  font-size: 12.5px; color: var(--text-muted);
  display: inline-flex; align-items: center; gap: 4px;
}
.gaps__count { font-weight: 700; color: var(--warning-500); }

@media (max-width: 640px) {
  .queue { flex-wrap: wrap; }
  .bars__label { width: 90px; }
}
</style>
