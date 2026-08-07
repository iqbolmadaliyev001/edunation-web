<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { centersApi, catalogApi } from '@/api'
import CenterCard from '@/components/centers/CenterCard.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Icon from '@/components/ui/Icon.vue'

const route = useRoute()
const router = useRouter()

const centers = ref([])
const count = ref(0)
const loading = ref(true)
const nextPage = ref(null)
const loadingMore = ref(false)

const regions = ref([])
const directions = ref([])

const filters = reactive({
  search: route.query.search || '',
  region: route.query.region || '',
  direction: route.query.direction || '',
  rating_min: route.query.rating_min || '',
  ordering: route.query.ordering || '-is_featured',
})

const sortOptions = [
  { value: '-is_featured', label: 'Tavsiya etilgan' },
  { value: '-rating', label: 'Reyting bo\'yicha' },
  { value: '-reviews_count', label: 'Sharhlar soni' },
  { value: '-students_count', label: 'O\'quvchilar soni' },
]
const ratingOptions = [
  { value: '4.5', label: '4,5+ yulduz' },
  { value: '4', label: '4+ yulduz' },
  { value: '3', label: '3+ yulduz' },
]

function buildParams() {
  const p = {}
  if (filters.search) p.search = filters.search
  if (filters.region) p.region = filters.region
  if (filters.direction) p.direction = filters.direction
  if (filters.rating_min) p.rating_min = filters.rating_min
  if (filters.ordering) p.ordering = filters.ordering
  return p
}

async function load() {
  loading.value = true
  // URL bilan sinxron
  router.replace({ query: buildParams() })
  try {
    const res = await centersApi.list(buildParams())
    centers.value = res.results || res
    count.value = res.count ?? centers.value.length
    nextPage.value = res.next || null
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (!nextPage.value) return
  loadingMore.value = true
  try {
    // next — to'liq URL; sahifa raqamini olamiz
    const url = new URL(nextPage.value, window.location.origin)
    const page = url.searchParams.get('page')
    const res = await centersApi.list({ ...buildParams(), page })
    centers.value.push(...(res.results || []))
    nextPage.value = res.next || null
  } finally {
    loadingMore.value = false
  }
}

function resetFilters() {
  filters.region = ''
  filters.direction = ''
  filters.rating_min = ''
  load()
}

watch(() => route.query.search, (v) => {
  if (v !== filters.search) {
    filters.search = v || ''
    load()
  }
})

onMounted(async () => {
  load()
  const [reg, dir] = await Promise.all([
    catalogApi.regions({ page_size: 100 }).catch(() => ({ results: [] })),
    catalogApi.directions({ page_size: 100 }).catch(() => ({ results: [] })),
  ])
  regions.value = (reg.results || reg).map((r) => ({ value: r.id, label: r.name_uz }))
  directions.value = (dir.results || dir).map((d) => ({ value: d.id, label: d.name_uz }))
})
</script>

<template>
  <div class="container catalog">
    <header class="catalog__head">
      <div>
        <h1 class="catalog__title">O'quv markazlari</h1>
        <p class="catalog__count">
          <template v-if="!loading">{{ count }} ta markaz topildi</template>
          <template v-else>Yuklanmoqda...</template>
        </p>
      </div>
      <div class="catalog__sort">
        <BaseSelect
          v-model="filters.ordering"
          :options="sortOptions"
          placeholder="Saralash"
          @update:model-value="load"
        />
      </div>
    </header>

    <div class="catalog__layout">
      <!-- Filtrlar -->
      <aside class="filters">
        <div class="filters__head">
          <span><Icon name="filter" :size="16" /> Filtrlar</span>
          <button class="filters__reset" @click="resetFilters">Tozalash</button>
        </div>

        <div class="filters__search">
          <Icon name="search" :size="17" />
          <input
            v-model="filters.search"
            type="text"
            placeholder="Markaz nomi..."
            @keyup.enter="load"
          />
        </div>

        <BaseSelect
          v-model="filters.region"
          label="Hudud"
          :options="regions"
          placeholder="Barcha hududlar"
          @update:model-value="load"
        />
        <BaseSelect
          v-model="filters.direction"
          label="Yo'nalish"
          :options="directions"
          placeholder="Barcha yo'nalishlar"
          @update:model-value="load"
        />
        <BaseSelect
          v-model="filters.rating_min"
          label="Minimal reyting"
          :options="ratingOptions"
          placeholder="Har qanday"
          @update:model-value="load"
        />

        <BaseButton block variant="soft" icon="search" @click="load">Qo'llash</BaseButton>
      </aside>

      <!-- Natijalar -->
      <div class="results">
        <div v-if="loading" class="grid cols-3">
          <BaseSkeleton v-for="i in 6" :key="i" h="300px" radius="var(--r-lg)" />
        </div>

        <template v-else-if="centers.length">
          <div class="grid cols-3">
            <CenterCard v-for="c in centers" :key="c.id" :center="c" />
          </div>
          <div v-if="nextPage" class="results__more">
            <BaseButton variant="secondary" :loading="loadingMore" @click="loadMore">
              Ko'proq ko'rsatish
            </BaseButton>
          </div>
        </template>

        <EmptyState
          v-else
          icon="search"
          title="Hech narsa topilmadi"
          text="Filtrlarni o'zgartirib ko'ring yoki qidiruv so'zini soddalashtiring."
        >
          <template #action>
            <BaseButton variant="soft" @click="resetFilters">Filtrlarni tozalash</BaseButton>
          </template>
        </EmptyState>
      </div>
    </div>
  </div>
</template>

<style scoped>
.catalog { padding-block: var(--sp-8) var(--sp-16); }
.catalog__head {
  display: flex; align-items: flex-end; justify-content: space-between; gap: var(--sp-4);
  margin-bottom: var(--sp-6);
}
.catalog__title { font-size: clamp(24px, 3.4vw, 34px); }
.catalog__count { color: var(--text-muted); margin-top: 4px; }
.catalog__sort { width: 220px; }

.catalog__layout { display: grid; grid-template-columns: 260px 1fr; gap: var(--sp-8); align-items: start; }

.filters {
  position: sticky; top: calc(var(--header-h) + 16px);
  display: flex; flex-direction: column; gap: var(--sp-4);
  padding: var(--sp-5);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-sm);
}
.filters__head {
  display: flex; align-items: center; justify-content: space-between;
  font-weight: 700; font-size: 15px;
}
.filters__head span { display: inline-flex; align-items: center; gap: 7px; }
.filters__reset { font-size: 13px; color: var(--sky-600); font-weight: 600; }
.filters__search {
  display: flex; align-items: center; gap: 8px;
  padding: 0 12px; height: 44px;
  border: 1px solid var(--border-strong); border-radius: 12px;
  color: var(--text-muted);
}
.filters__search input { border: none; background: none; flex: 1; color: var(--text); }
.filters__search input:focus { outline: none; }

.results__more { display: flex; justify-content: center; margin-top: var(--sp-8); }

@media (max-width: 900px) {
  .catalog__layout { grid-template-columns: 1fr; }
  .filters { position: static; }
  .catalog__sort { width: 180px; }
}
</style>
