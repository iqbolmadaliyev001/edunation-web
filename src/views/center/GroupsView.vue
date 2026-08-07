<script setup>
import { ref, watch, onMounted } from 'vue'
import { learningApi } from '@/api'
import { useCenterStore } from '@/stores/center'
import { dateShort } from '@/lib/format'
import PageHeader from '@/components/panel/PageHeader.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Icon from '@/components/ui/Icon.vue'

const centerStore = useCenterStore()
const groups = ref([])
const loading = ref(true)

const STATUS = {
  recruiting: { label: "To'planmoqda", tone: 'brand' },
  ongoing: { label: 'Davom etmoqda', tone: 'success' },
  paused: { label: "To'xtatilgan", tone: 'warning' },
  finished: { label: 'Tugagan', tone: 'neutral' },
}
const DAYS = { mon: 'Du', tue: 'Se', wed: 'Cho', thu: 'Pa', fri: 'Ju', sat: 'Sha', sun: 'Ya' }

function scheduleText(schedule) {
  if (!Array.isArray(schedule) || !schedule.length) return '—'
  const days = schedule.map((s) => DAYS[s.day] || s.day).join(', ')
  const time = schedule[0]?.start ? `${schedule[0].start}` : ''
  return `${days}${time ? ' · ' + time : ''}`
}

async function load() {
  if (!centerStore.active) return
  loading.value = true
  try {
    const res = await learningApi.groups({ center: centerStore.active.id, page_size: 100 })
    groups.value = res.results || res
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
    <PageHeader title="Guruhlar" subtitle="Faol guruhlar, jadval va band joylar" />

    <BaseSpinner v-if="loading" center />
    <EmptyState v-else-if="!groups.length" icon="users" title="Guruhlar yo'q"
                text="Kurs qo'shgandan so'ng unga guruh biriktira olasiz." />

    <div v-else class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Guruh</th>
            <th>Kurs</th>
            <th>O'qituvchi</th>
            <th>Jadval</th>
            <th>Joylar</th>
            <th>Holat</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in groups" :key="g.id">
            <td>
              <div class="g-name">{{ g.name }}</div>
              <div class="g-sub">{{ g.room || '—' }} · {{ dateShort(g.start_date) }}dan</div>
            </td>
            <td class="muted">{{ g.course_title }}</td>
            <td>
              <div v-if="g.teacher_detail" class="g-teacher">
                <BaseAvatar :name="g.teacher_detail.full_name" :src="g.teacher_detail.photo" :size="28" />
                {{ g.teacher_detail.full_name }}
              </div>
              <span v-else class="muted">—</span>
            </td>
            <td class="muted">{{ scheduleText(g.schedule) }}</td>
            <td>
              <div class="seats">
                <span class="seats__bar">
                  <span class="seats__fill" :style="{ width: (g.enrolled_count / (g.capacity || 1) * 100) + '%' }" />
                </span>
                <span class="seats__text tabular">{{ g.enrolled_count }}/{{ g.capacity }}</span>
              </div>
            </td>
            <td><BaseBadge :tone="STATUS[g.status]?.tone || 'neutral'" size="sm">{{ STATUS[g.status]?.label || g.status }}</BaseBadge></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); box-shadow: var(--shadow-sm); overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; min-width: 720px; }
.table th { text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-muted); padding: 14px 16px; border-bottom: 1px solid var(--border); background: var(--surface-2); }
.table td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 14px; vertical-align: middle; }
.table tbody tr:last-child td { border-bottom: none; }
.table tbody tr:hover { background: var(--sky-50); }
.g-name { font-weight: 700; }
.g-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.muted { color: var(--text-soft); }
.g-teacher { display: inline-flex; align-items: center; gap: 8px; }
.seats { display: flex; align-items: center; gap: 10px; }
.seats__bar { width: 64px; height: 7px; background: var(--ink-100); border-radius: 999px; overflow: hidden; }
.seats__fill { display: block; height: 100%; background: var(--grad-brand); border-radius: 999px; }
.seats__text { font-size: 12.5px; color: var(--text-soft); }
</style>
