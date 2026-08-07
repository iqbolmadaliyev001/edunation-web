<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { reviewsApi } from '@/api'
import { useUiStore } from '@/stores/ui'
import { timeAgo } from '@/lib/format'
import PageHeader from '@/components/panel/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import RatingStars from '@/components/ui/RatingStars.vue'
import Icon from '@/components/ui/Icon.vue'

const ui = useUiStore()

const tabs = [
  { key: 'queue', label: 'Navbat', icon: 'clock' },
  { key: 'published', label: 'Chop etilgan', icon: 'check-circle' },
  { key: 'rejected', label: 'Rad etilgan', icon: 'x-circle' },
]

const tab = ref('queue')
const items = ref([])
const count = ref(0)
const page = ref(1)
const loading = ref(true)
const busyId = ref(null)

const pageCount = computed(() => Math.max(1, Math.ceil(count.value / 20)))

async function load() {
  loading.value = true
  try {
    const params = { page: page.value, page_size: 20 }
    const data =
      tab.value === 'queue'
        ? await reviewsApi.pending(params)
        : await reviewsApi.list({ ...params, status: tab.value })

    items.value = data.results
    count.value = data.count
  } catch (e) {
    ui.error(e.message)
  } finally {
    loading.value = false
  }
}

watch(tab, () => {
  page.value = 1
  load()
})
watch(page, load)

async function moderate(review, status) {
  busyId.value = review.id
  try {
    await reviewsApi.moderate(review.id, { status })
    ui.success(status === 'published' ? 'Sharh chop etildi.' : 'Sharh rad etildi.')
    // Navbatdan darhol yo'qoladi, boshqa tablarda holat yangilanadi
    if (tab.value === 'queue') {
      items.value = items.value.filter((r) => r.id !== review.id)
      count.value = Math.max(0, count.value - 1)
    } else {
      review.status = status
    }
  } catch (e) {
    ui.error(e.message)
  } finally {
    busyId.value = null
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      title="Sharhlar moderatsiyasi"
      subtitle="Platformaga ishonch shu yerdan boshlanadi — spam va soxta sharhlarni to'sing"
    />

    <div class="tabs">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="tab"
        :class="{ 'tab--active': tab === t.key }"
        @click="tab = t.key"
      >
        <Icon :name="t.icon" :size="16" />
        {{ t.label }}
        <span v-if="t.key === 'queue' && tab === 'queue' && count" class="tab__count">{{ count }}</span>
      </button>
    </div>

    <BaseSpinner v-if="loading" center />

    <EmptyState
      v-else-if="!items.length"
      icon="check-circle"
      title="Navbat bo'sh"
      text="Barcha sharhlar ko'rib chiqilgan."
    />

    <template v-else>
      <div class="list">
        <article v-for="r in items" :key="r.id" class="card">
          <header class="card__head">
            <BaseAvatar :name="r.display_author" :src="r.author_avatar" :size="40" />
            <div class="card__who">
              <div class="card__author">
                {{ r.display_author }}
                <BaseBadge v-if="r.is_verified" tone="success" size="sm" icon="check">
                  Tasdiqlangan o'quvchi
                </BaseBadge>
                <BaseBadge v-if="r.reported_count" tone="danger" size="sm">
                  {{ r.reported_count }} shikoyat
                </BaseBadge>
              </div>
              <div class="card__sub">
                <RatingStars :value="r.rating" :size="13" />
                <span class="dot-sep">·</span>
                <RouterLink
                  :to="{ name: 'center-detail', params: { slug: r.center_slug } }"
                  class="card__center"
                >
                  {{ r.center_name }}
                </RouterLink>
                <span class="dot-sep">·</span>
                <span>{{ timeAgo(r.created_at) }}</span>
              </div>
            </div>

            <BaseBadge
              v-if="tab !== 'queue'"
              :tone="r.status === 'published' ? 'success' : 'danger'"
              size="sm"
            >
              {{ r.status === 'published' ? 'Chop etilgan' : 'Rad etilgan' }}
            </BaseBadge>
          </header>

          <p v-if="r.text" class="card__text">{{ r.text }}</p>

          <div v-if="r.pros || r.cons" class="card__pc">
            <div v-if="r.pros" class="pc pc--pro">
              <Icon name="thumbs-up" :size="14" /> {{ r.pros }}
            </div>
            <div v-if="r.cons" class="pc pc--con">
              <Icon name="minus" :size="14" /> {{ r.cons }}
            </div>
          </div>

          <footer class="card__foot">
            <BaseButton
              v-if="r.status !== 'published'"
              size="sm" icon="check"
              :loading="busyId === r.id"
              @click="moderate(r, 'published')"
            >
              Chop etish
            </BaseButton>
            <BaseButton
              v-if="r.status !== 'rejected'"
              size="sm" variant="ghost" icon="x"
              :loading="busyId === r.id"
              @click="moderate(r, 'rejected')"
            >
              Rad etish
            </BaseButton>
          </footer>
        </article>
      </div>

      <div v-if="pageCount > 1" class="pager">
        <BaseButton
          size="sm" variant="secondary" icon="chevron-left"
          :disabled="page === 1" @click="page--"
        >
          Oldingi
        </BaseButton>
        <span class="pager__info tabular">{{ page }} / {{ pageCount }}</span>
        <BaseButton
          size="sm" variant="secondary" icon-right="chevron-right"
          :disabled="page === pageCount" @click="page++"
        >
          Keyingi
        </BaseButton>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tabs {
  display: flex; gap: 4px; flex-wrap: wrap;
  margin-bottom: var(--sp-5); padding: 4px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-md); width: fit-content;
}
.tab {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 15px; border-radius: var(--r-sm);
  font-size: 14px; font-weight: 600; color: var(--text-soft);
  transition: background .15s, color .15s;
}
.tab:hover { background: var(--sky-50); color: var(--sky-700); }
.tab--active { background: var(--grad-brand-soft); color: var(--sky-700); }
.tab__count {
  min-width: 20px; height: 20px; padding: 0 6px;
  display: grid; place-items: center;
  border-radius: var(--r-full);
  background: var(--warning-500); color: #fff;
  font-size: 11px; font-weight: 700;
}

.list { display: flex; flex-direction: column; gap: var(--sp-4); }
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--sp-5);
  box-shadow: var(--shadow-xs);
}
.card__head { display: flex; align-items: flex-start; gap: 12px; margin-bottom: var(--sp-3); }
.card__who { flex: 1; min-width: 0; }
.card__author {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  font-size: 15px; font-weight: 700;
}
.card__sub {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  font-size: 12.5px; color: var(--text-muted); margin-top: 3px;
}
.card__center { color: var(--sky-600); font-weight: 600; }
.dot-sep { color: var(--ink-300); }

.card__text { font-size: 14.5px; line-height: 1.6; color: var(--text-soft); margin-bottom: var(--sp-3); }

.card__pc { display: flex; flex-direction: column; gap: 6px; margin-bottom: var(--sp-4); }
.pc {
  display: flex; align-items: flex-start; gap: 7px;
  font-size: 13.5px; padding: 8px 12px; border-radius: var(--r-sm);
}
.pc--pro { background: var(--success-50); color: var(--success-500); }
.pc--con { background: var(--danger-50); color: var(--danger-500); }

.card__foot { display: flex; gap: var(--sp-2); padding-top: var(--sp-3); border-top: 1px solid var(--border); }

.pager {
  display: flex; align-items: center; justify-content: center; gap: var(--sp-4);
  margin-top: var(--sp-6);
}
.pager__info { font-size: 14px; font-weight: 600; color: var(--text-soft); }
</style>
