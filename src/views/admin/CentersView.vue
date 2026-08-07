<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { centersApi } from '@/api'
import { useUiStore } from '@/stores/ui'
import { dateShort, money } from '@/lib/format'
import PageHeader from '@/components/panel/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import RatingStars from '@/components/ui/RatingStars.vue'
import Icon from '@/components/ui/Icon.vue'

const ui = useUiStore()

const tabs = [
  { key: 'pending', label: 'Moderatsiyada', icon: 'clock' },
  { key: 'active', label: 'Faol', icon: 'check-circle' },
  { key: 'suspended', label: "To'xtatilgan", icon: 'x-circle' },
  { key: '', label: 'Barchasi', icon: 'building' },
]

const tab = ref('pending')
const search = ref('')
const items = ref([])
const count = ref(0)
const page = ref(1)
const loading = ref(true)

// Moderatsiya oynasi
const target = ref(null)
const decision = ref('active')
const note = ref('')
const saving = ref(false)

const pageCount = computed(() => Math.max(1, Math.ceil(count.value / 20)))

async function load() {
  loading.value = true
  try {
    const params = { page: page.value, page_size: 20 }
    if (tab.value) params.status = tab.value
    if (search.value.trim()) params.search = search.value.trim()

    const data = await centersApi.list(params)
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

let searchTimer
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    load()
  }, 350)
})

function openModeration(center, preset) {
  target.value = center
  decision.value = preset
  note.value = ''
}

async function submitModeration() {
  saving.value = true
  try {
    await centersApi.moderate(target.value.slug, {
      status: decision.value,
      moderation_note: note.value,
    })
    ui.success(
      decision.value === 'active'
        ? `«${target.value.name}» tasdiqlandi.`
        : `«${target.value.name}» holati yangilandi.`
    )
    target.value = null
    load()
  } catch (e) {
    ui.error(e.message)
  } finally {
    saving.value = false
  }
}

async function toggleFeatured(center) {
  try {
    await centersApi.moderate(center.slug, { is_featured: !center.is_featured })
    center.is_featured = !center.is_featured
    ui.success(
      center.is_featured
        ? 'Bosh sahifaga chiqarildi.'
        : 'Bosh sahifadan olib tashlandi.'
    )
  } catch (e) {
    ui.error(e.message)
  }
}

const statusTone = {
  active: 'success',
  pending: 'warning',
  suspended: 'danger',
  rejected: 'danger',
  draft: 'neutral',
}
const statusLabel = {
  active: 'Faol',
  pending: 'Moderatsiyada',
  suspended: "To'xtatilgan",
  rejected: 'Rad etilgan',
  draft: 'Qoralama',
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      title="Markazlar"
      :subtitle="`Jami ${count} ta markaz — moderatsiya va nazorat`"
    >
      <template #actions>
        <div style="width: 260px">
          <BaseInput v-model="search" placeholder="Nom yoki manzil bo'yicha" icon="search" />
        </div>
      </template>
    </PageHeader>

    <!-- Holat bo'yicha tablar -->
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
      </button>
    </div>

    <BaseSpinner v-if="loading" center />

    <EmptyState
      v-else-if="!items.length"
      icon="building"
      title="Markaz topilmadi"
      :text="tab === 'pending' ? 'Moderatsiya navbati bo\'sh — hammasi ko\'rib chiqilgan.' : 'Boshqa filtr bilan urinib ko\'ring.'"
    />

    <template v-else>
      <div class="list">
        <article v-for="c in items" :key="c.id" class="row">
          <div class="row__logo">
            <img v-if="c.logo" :src="c.logo" :alt="c.name" />
            <Icon v-else name="building" :size="22" />
          </div>

          <div class="row__main">
            <div class="row__title">
              <RouterLink :to="{ name: 'center-detail', params: { slug: c.slug } }" class="row__name">
                {{ c.name }}
              </RouterLink>
              <BaseBadge :tone="statusTone[c.status] || 'neutral'" size="sm">
                {{ statusLabel[c.status] || c.status }}
              </BaseBadge>
              <BaseBadge v-if="c.is_featured" tone="gold" size="sm" icon="sparkles">
                Bosh sahifada
              </BaseBadge>
            </div>
            <div class="row__meta">
              <span v-if="c.region_name"><Icon name="map-pin" :size="13" /> {{ c.region_name }}</span>
              <span><Icon name="phone" :size="13" /> {{ c.phone }}</span>
              <span><Icon name="calendar" :size="13" /> {{ dateShort(c.created_at) }}</span>
            </div>
          </div>

          <div class="row__stats">
            <div class="stat">
              <RatingStars :value="Number(c.rating)" :size="13" />
              <span class="stat__sub">{{ c.reviews_count }} sharh</span>
            </div>
            <div class="stat">
              <b class="tabular">{{ c.students_count }}</b>
              <span class="stat__sub">o'quvchi</span>
            </div>
            <div class="stat">
              <b class="tabular">{{ c.courses_count }}</b>
              <span class="stat__sub">kurs</span>
            </div>
          </div>

          <div class="row__actions">
            <template v-if="c.status === 'pending'">
              <BaseButton size="sm" icon="check" @click="openModeration(c, 'active')">
                Tasdiqlash
              </BaseButton>
              <BaseButton size="sm" variant="ghost" icon="x" @click="openModeration(c, 'rejected')">
                Rad etish
              </BaseButton>
            </template>
            <template v-else>
              <button
                class="icon-btn"
                :class="{ 'icon-btn--gold': c.is_featured }"
                :title="c.is_featured ? 'Bosh sahifadan olib tashlash' : 'Bosh sahifaga chiqarish'"
                @click="toggleFeatured(c)"
              >
                <Icon name="sparkles" :size="17" />
              </button>
              <BaseButton size="sm" variant="secondary" @click="openModeration(c, c.status)">
                Holat
              </BaseButton>
            </template>
          </div>
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

    <!-- Moderatsiya oynasi -->
    <BaseModal :open="!!target" :title="target?.name" @close="target = null">
      <div class="mod">
        <p class="mod__hint">Markaz holatini tanlang. Izoh markaz egasiga ko'rinadi.</p>

        <div class="mod__options">
          <label
            v-for="opt in [
              { value: 'active', label: 'Tasdiqlash', desc: 'Markaz katalogda ko\'rinadi', tone: 'ok' },
              { value: 'pending', label: 'Moderatsiyaga qaytarish', desc: 'Qayta ko\'rib chiqiladi', tone: 'warn' },
              { value: 'suspended', label: 'To\'xtatish', desc: 'Vaqtincha yashiriladi', tone: 'bad' },
              { value: 'rejected', label: 'Rad etish', desc: 'Talablarga javob bermaydi', tone: 'bad' },
            ]"
            :key="opt.value"
            class="mod__opt"
            :class="[`mod__opt--${opt.tone}`, { 'mod__opt--on': decision === opt.value }]"
          >
            <input v-model="decision" type="radio" :value="opt.value" />
            <span class="mod__opt-body">
              <b>{{ opt.label }}</b>
              <small>{{ opt.desc }}</small>
            </span>
            <Icon v-if="decision === opt.value" name="check-circle" :size="18" />
          </label>
        </div>

        <label class="mod__note">
          <span>Izoh <small>(ixtiyoriy)</small></span>
          <textarea
            v-model="note"
            rows="3"
            placeholder="Masalan: litsenziya nusxasi yuklanmagan"
          />
        </label>
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="target = null">Bekor qilish</BaseButton>
        <BaseButton :loading="saving" @click="submitModeration">Saqlash</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.tabs {
  display: flex; gap: 4px; flex-wrap: wrap;
  margin-bottom: var(--sp-5);
  padding: 4px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  width: fit-content;
}
.tab {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 15px; border-radius: var(--r-sm);
  font-size: 14px; font-weight: 600; color: var(--text-soft);
  transition: background .15s, color .15s;
}
.tab:hover { background: var(--sky-50); color: var(--sky-700); }
.tab--active { background: var(--grad-brand-soft); color: var(--sky-700); }

.list { display: flex; flex-direction: column; gap: 10px; }
.row {
  display: flex; align-items: center; gap: var(--sp-4);
  padding: var(--sp-4);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-xs);
  transition: border-color .15s, box-shadow .15s;
}
.row:hover { border-color: var(--sky-200); box-shadow: var(--shadow-sm); }

.row__logo {
  width: 52px; height: 52px; flex-shrink: 0;
  border-radius: var(--r-md); overflow: hidden;
  background: var(--grad-brand-soft); color: var(--sky-600);
  display: grid; place-items: center;
}
.row__logo img { width: 100%; height: 100%; object-fit: cover; }

.row__main { flex: 1; min-width: 0; }
.row__title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
.row__name { font-size: 15.5px; font-weight: 700; color: var(--text); }
.row__name:hover { color: var(--sky-600); }
.row__meta { display: flex; gap: var(--sp-4); flex-wrap: wrap; font-size: 12.5px; color: var(--text-muted); }
.row__meta span { display: inline-flex; align-items: center; gap: 4px; }

.row__stats { display: flex; gap: var(--sp-5); flex-shrink: 0; }
.stat { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 62px; }
.stat b { font-size: 17px; font-weight: 700; }
.stat__sub { font-size: 11.5px; color: var(--text-muted); }

.row__actions { display: flex; align-items: center; gap: var(--sp-2); flex-shrink: 0; }
.icon-btn {
  width: 36px; height: 36px; display: grid; place-items: center;
  border-radius: var(--r-sm); color: var(--text-muted);
  border: 1px solid var(--border);
}
.icon-btn:hover { background: var(--sky-50); color: var(--sky-600); border-color: var(--sky-200); }
.icon-btn--gold { color: var(--gold-500); background: var(--warning-50); border-color: rgba(224,165,23,.3); }

.pager {
  display: flex; align-items: center; justify-content: center; gap: var(--sp-4);
  margin-top: var(--sp-6);
}
.pager__info { font-size: 14px; font-weight: 600; color: var(--text-soft); }

/* Moderatsiya oynasi */
.mod__hint { font-size: 14px; color: var(--text-soft); margin-bottom: var(--sp-4); }
.mod__options { display: flex; flex-direction: column; gap: 8px; margin-bottom: var(--sp-4); }
.mod__opt {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; cursor: pointer;
  border: 1px solid var(--border); border-radius: var(--r-md);
  transition: border-color .15s, background .15s;
}
.mod__opt input { position: absolute; opacity: 0; pointer-events: none; }
.mod__opt-body { flex: 1; display: flex; flex-direction: column; }
.mod__opt-body b { font-size: 14.5px; }
.mod__opt-body small { font-size: 12.5px; color: var(--text-muted); }
.mod__opt:hover { border-color: var(--border-strong); }
.mod__opt--on { border-color: var(--sky-400); background: var(--sky-50); color: var(--sky-700); }
.mod__opt--on.mod__opt--bad { border-color: var(--danger-500); background: var(--danger-50); color: var(--danger-500); }
.mod__opt--on.mod__opt--warn { border-color: var(--warning-500); background: var(--warning-50); color: var(--warning-600); }

.mod__note { display: flex; flex-direction: column; gap: 6px; }
.mod__note > span { font-size: 13.5px; font-weight: 600; color: var(--text-soft); }
.mod__note small { font-weight: 400; color: var(--text-muted); }
.mod__note textarea {
  width: 100%; padding: 11px 13px;
  border: 1px solid var(--border-strong); border-radius: var(--r-sm);
  font: inherit; font-size: 14px; color: var(--text);
  background: var(--surface); resize: vertical;
}
.mod__note textarea:focus { outline: none; border-color: var(--sky-400); box-shadow: var(--focus-ring); }

@media (max-width: 900px) {
  .row { flex-wrap: wrap; }
  .row__stats { order: 3; width: 100%; justify-content: flex-start; padding-top: 10px; border-top: 1px solid var(--border); }
  .row__actions { order: 4; margin-left: auto; }
}
</style>
