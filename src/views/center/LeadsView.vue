<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { crmApi } from '@/api'
import { useCenterStore } from '@/stores/center'
import { useUiStore } from '@/stores/ui'
import { phoneFormat, timeAgo } from '@/lib/format'
import PageHeader from '@/components/panel/PageHeader.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import Icon from '@/components/ui/Icon.vue'

const centerStore = useCenterStore()
const ui = useUiStore()

const leads = ref([])
const loading = ref(true)
const dragId = ref(null)
const overStage = ref(null)

const STAGES = [
  { key: 'new', label: 'Yangi', tone: 'brand' },
  { key: 'contacted', label: "Bog'lanildi", tone: 'neutral' },
  { key: 'trial_booked', label: 'Sinovga yozildi', tone: 'warning' },
  { key: 'trial_attended', label: 'Sinovda bo\'ldi', tone: 'warning' },
  { key: 'won', label: 'Yozildi', tone: 'success' },
  { key: 'lost', label: "Yo'qotildi", tone: 'danger' },
]

const byStage = computed(() => {
  const map = Object.fromEntries(STAGES.map((s) => [s.key, []]))
  for (const l of leads.value) (map[l.stage] || (map[l.stage] = [])).push(l)
  return map
})

const SOURCE_LABEL = {
  platform: 'Platforma', mobile: 'Mobil', telegram: 'Telegram', instagram: 'Instagram',
  call: 'Qo\'ng\'iroq', walk_in: 'O\'zi kelgan', referral: 'Tavsiya', other: 'Boshqa',
}

async function load() {
  if (!centerStore.active) return
  loading.value = true
  try {
    const res = await crmApi.leads({ center: centerStore.active.id, page_size: 200 })
    leads.value = res.results || res
  } finally {
    loading.value = false
  }
}

function onDrop(stageKey) {
  overStage.value = null
  const id = dragId.value
  dragId.value = null
  const lead = leads.value.find((l) => l.id === id)
  if (!lead || lead.stage === stageKey) return
  const prev = lead.stage
  lead.stage = stageKey // optimistik
  crmApi.updateLead(id, { stage: stageKey }).catch(() => {
    lead.stage = prev
    ui.error('Bosqichni o\'zgartirib bo\'lmadi.')
  })
}

watch(() => centerStore.active?.id, load)
onMounted(async () => {
  await centerStore.load()
  load()
})
</script>

<template>
  <div>
    <PageHeader title="Lidlar (CRM)" subtitle="Potensial o'quvchilarni bosqichma-bosqich yozuvga aylantiring">
      <template #actions>
        <BaseBadge tone="brand" icon="briefcase">{{ leads.length }} lid</BaseBadge>
      </template>
    </PageHeader>

    <BaseSpinner v-if="loading" center />

    <div v-else class="board">
      <div
        v-for="col in STAGES"
        :key="col.key"
        class="col"
        :class="{ 'col--over': overStage === col.key }"
        @dragover.prevent="overStage = col.key"
        @dragleave="overStage === col.key && (overStage = null)"
        @drop="onDrop(col.key)"
      >
        <div class="col__head">
          <span class="col__title">
            <i class="col__dot" :class="`col__dot--${col.tone}`"></i>
            {{ col.label }}
          </span>
          <span class="col__count">{{ byStage[col.key]?.length || 0 }}</span>
        </div>

        <div class="col__list">
          <article
            v-for="lead in byStage[col.key]"
            :key="lead.id"
            class="lead"
            :class="{ 'lead--dragging': dragId === lead.id, 'lead--overdue': lead.is_overdue }"
            draggable="true"
            @dragstart="dragId = lead.id"
            @dragend="dragId = null"
          >
            <div class="lead__top">
              <span class="lead__name">{{ lead.full_name }}</span>
              <span v-if="lead.age" class="lead__age">{{ lead.age }} yosh</span>
            </div>
            <a v-if="lead.phone" :href="`tel:${lead.phone}`" class="lead__phone">
              <Icon name="phone" :size="13" /> {{ phoneFormat(lead.phone) }}
            </a>
            <div v-if="lead.course_title" class="lead__course">
              <Icon name="book-open" :size="13" /> {{ lead.course_title }}
            </div>
            <div class="lead__foot">
              <span class="lead__source">{{ SOURCE_LABEL[lead.source] || lead.source }}</span>
              <span class="lead__time" :class="{ overdue: lead.is_overdue }">
                <Icon v-if="lead.is_overdue" name="clock" :size="12" />
                {{ timeAgo(lead.created_at) }}
              </span>
            </div>
          </article>

          <div v-if="!byStage[col.key]?.length" class="col__empty">Bo'sh</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board {
  display: flex;
  gap: var(--sp-4);
  overflow-x: auto;
  padding-bottom: var(--sp-4);
  min-height: 60vh;
}
.col {
  flex: 0 0 264px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--sp-3);
  display: flex; flex-direction: column;
  transition: background .15s, border-color .15s;
}
.col--over { border-color: var(--sky-400); background: var(--sky-50); }
.col__head { display: flex; align-items: center; justify-content: space-between; padding: 6px 8px var(--sp-3); }
.col__title { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; }
.col__dot { width: 8px; height: 8px; border-radius: 50%; }
.col__dot--brand { background: var(--sky-500); }
.col__dot--neutral { background: var(--ink-400); }
.col__dot--warning { background: var(--warning-500); }
.col__dot--success { background: var(--success-500); }
.col__dot--danger { background: var(--danger-500); }
.col__count { font-size: 12px; font-weight: 700; color: var(--text-muted); background: var(--surface); padding: 2px 9px; border-radius: var(--r-full); }
.col__list { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.col__empty { text-align: center; color: var(--text-muted); font-size: 13px; padding: var(--sp-6) 0; }

.lead {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  padding: 12px;
  box-shadow: var(--shadow-xs);
  cursor: grab;
  transition: box-shadow .15s, transform .1s;
}
.lead:hover { box-shadow: var(--shadow-sm); }
.lead:active { cursor: grabbing; }
.lead--dragging { opacity: .5; transform: rotate(1.5deg); }
.lead--overdue { border-left: 3px solid var(--warning-500); }
.lead__top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.lead__name { font-weight: 700; font-size: 14px; }
.lead__age { font-size: 11.5px; color: var(--text-muted); flex-shrink: 0; }
.lead__phone { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; color: var(--sky-700); margin-top: 6px; }
.lead__course { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-muted); margin-top: 5px; }
.lead__foot { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border); }
.lead__source { font-size: 11px; font-weight: 600; color: var(--ink-500); background: var(--ink-50); padding: 2px 7px; border-radius: var(--r-full); }
.lead__time { font-size: 11.5px; color: var(--text-muted); display: inline-flex; align-items: center; gap: 3px; }
.lead__time.overdue { color: var(--warning-500); font-weight: 600; }
</style>
