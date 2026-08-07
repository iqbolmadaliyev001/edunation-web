<script setup>
import { ref, watch, onMounted } from 'vue'
import { centersApi } from '@/api'
import { useCenterStore } from '@/stores/center'
import { useUiStore } from '@/stores/ui'
import { ratingText } from '@/lib/format'
import PageHeader from '@/components/panel/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Icon from '@/components/ui/Icon.vue'

const centerStore = useCenterStore()
const ui = useUiStore()
const teachers = ref([])
const loading = ref(true)

async function load() {
  if (!centerStore.active) return
  loading.value = true
  try {
    const res = await centersApi.teachers({ center: centerStore.active.id, page_size: 100 })
    teachers.value = res.results || res
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
    <PageHeader title="O'qituvchilar" subtitle="Markazingiz jamoasi va ularning reytingi">
      <template #actions>
        <BaseButton icon="plus" @click="ui.toast('O\'qituvchi qo\'shish formasi tez orada.', 'info')">
          O'qituvchi qo'shish
        </BaseButton>
      </template>
    </PageHeader>

    <BaseSpinner v-if="loading" center />
    <EmptyState v-else-if="!teachers.length" icon="graduation-cap" title="O'qituvchilar qo'shilmagan"
                text="Jamoangiz a'zolarini qo'shing — ular markaz sahifasida ko'rinadi." />

    <div v-else class="grid cols-3">
      <div v-for="t in teachers" :key="t.id" class="teacher">
        <div class="teacher__top">
          <BaseAvatar :name="t.full_name" :src="t.photo" :size="60" />
          <span class="teacher__rating"><Icon name="star" :size="14" class="gold" /> {{ ratingText(t.rating) }}</span>
        </div>
        <h3 class="teacher__name">{{ t.full_name }}</h3>
        <p class="teacher__exp">{{ t.experience_years }} yil tajriba</p>
        <div v-if="t.directions_detail?.length" class="teacher__dirs">
          <span v-for="d in t.directions_detail.slice(0, 3)" :key="d.id" class="chip">{{ d.name_uz }}</span>
        </div>
        <div v-if="t.certificates?.length" class="teacher__certs">
          <BaseBadge v-for="c in t.certificates.slice(0, 2)" :key="c" tone="success" size="sm" icon="award">{{ c }}</BaseBadge>
        </div>
        <div class="teacher__foot">
          <span><Icon name="users" :size="14" /> {{ t.students_count }} o'quvchi</span>
          <span :class="t.is_public ? 'ok' : 'muted'">
            <Icon :name="t.is_public ? 'eye' : 'x-circle'" :size="14" />
            {{ t.is_public ? 'Ochiq' : 'Yopiq' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.teacher { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--sp-5); box-shadow: var(--shadow-sm); }
.teacher__top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--sp-3); }
.teacher__rating { display: inline-flex; align-items: center; gap: 4px; font-weight: 700; font-size: 14px; background: var(--ink-50); padding: 4px 10px; border-radius: var(--r-full); }
.gold { color: var(--gold-500); fill: var(--gold-500); }
.teacher__name { font-size: 17px; }
.teacher__exp { color: var(--text-muted); font-size: 13.5px; margin-top: 2px; }
.teacher__dirs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: var(--sp-3); }
.chip { font-size: 11.5px; font-weight: 600; padding: 3px 9px; border-radius: var(--r-full); background: var(--sky-50); color: var(--sky-700); }
.teacher__certs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.teacher__foot { display: flex; align-items: center; justify-content: space-between; margin-top: var(--sp-4); padding-top: var(--sp-4); border-top: 1px solid var(--border); font-size: 13px; color: var(--text-soft); }
.teacher__foot > span { display: inline-flex; align-items: center; gap: 5px; }
.ok { color: var(--success-500); }
.muted { color: var(--text-muted); }
</style>
