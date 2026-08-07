<script setup>
import { ref, watch, onMounted } from 'vue'
import { learningApi } from '@/api'
import { useCenterStore } from '@/stores/center'
import { useUiStore } from '@/stores/ui'
import { money } from '@/lib/format'
import PageHeader from '@/components/panel/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Icon from '@/components/ui/Icon.vue'

const centerStore = useCenterStore()
const ui = useUiStore()
const courses = ref([])
const loading = ref(true)

const FORMAT = { offline: 'Oflayn', online: 'Onlayn', hybrid: 'Gibrid' }
const LEVEL = { beginner: 'Boshlang\'ich', elementary: 'Elementar', intermediate: 'O\'rta', advanced: 'Yuqori', all: 'Barcha daraja' }

async function load() {
  if (!centerStore.active) return
  loading.value = true
  try {
    const res = await learningApi.courses({ center: centerStore.active.id, page_size: 100 })
    courses.value = res.results || res
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
    <PageHeader title="Kurslar" subtitle="Markazingiz taklif qiladigan o'quv dasturlari">
      <template #actions>
        <BaseButton icon="plus" @click="ui.toast('Kurs qo\'shish formasi tez orada.', 'info')">
          Kurs qo'shish
        </BaseButton>
      </template>
    </PageHeader>

    <BaseSpinner v-if="loading" center />

    <EmptyState v-else-if="!courses.length" icon="book-open" title="Hali kurs qo'shilmagan"
                text="Birinchi kursingizni qo'shing — u markaz sahifasida ko'rinadi.">
      <template #action>
        <BaseButton icon="plus" @click="ui.toast('Kurs qo\'shish formasi tez orada.', 'info')">Kurs qo'shish</BaseButton>
      </template>
    </EmptyState>

    <div v-else class="grid cols-3">
      <div v-for="c in courses" :key="c.id" class="course">
        <div class="course__head">
          <BaseBadge tone="brand" size="sm">{{ c.direction_detail?.name_uz || 'Kurs' }}</BaseBadge>
          <BaseBadge v-if="!c.is_active" tone="neutral" size="sm">Nofaol</BaseBadge>
        </div>
        <h3 class="course__title">{{ c.title }}</h3>
        <div class="course__tags">
          <span class="course__tag"><Icon name="clock" :size="13" /> {{ c.duration_months }} oy</span>
          <span class="course__tag"><Icon name="calendar" :size="13" /> haftada {{ c.lessons_per_week }}</span>
          <span class="course__tag">{{ FORMAT[c.format] || c.format }}</span>
        </div>
        <div class="course__foot">
          <div class="course__price">
            <span class="course__price-val tabular">{{ money(c.price_monthly, { short: true }) }}</span>
            <span class="course__price-suf">/oy</span>
          </div>
          <div class="course__stats">
            <span><Icon name="users" :size="14" /> {{ c.students_count }}</span>
            <span v-if="c.open_groups" class="course__open"><i></i> {{ c.open_groups }} ochiq guruh</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.course { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--sp-5); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; transition: box-shadow .18s, border-color .18s; }
.course:hover { box-shadow: var(--shadow-md); border-color: var(--sky-200); }
.course__head { display: flex; justify-content: space-between; gap: 8px; margin-bottom: var(--sp-3); }
.course__title { font-size: 17px; line-height: 1.3; margin-bottom: var(--sp-3); }
.course__tags { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: var(--sp-4); }
.course__tag { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 500; color: var(--text-soft); background: var(--ink-50); padding: 4px 9px; border-radius: var(--r-full); }
.course__foot { margin-top: auto; padding-top: var(--sp-4); border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.course__price-val { font-weight: 800; font-family: var(--font-display); font-size: 18px; color: var(--ink-800); }
.course__price-suf { font-size: 12px; color: var(--text-muted); }
.course__stats { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
.course__stats > span { display: inline-flex; align-items: center; gap: 4px; font-size: 12.5px; color: var(--text-soft); }
.course__open { color: var(--success-500) !important; font-weight: 600; }
.course__open i { width: 6px; height: 6px; border-radius: 50%; background: var(--success-500); display: inline-block; }
</style>
