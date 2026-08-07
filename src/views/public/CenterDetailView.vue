<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { centersApi, reviewsApi } from '@/api'
import { ratingText, compact, phoneFormat, priceRange } from '@/lib/format'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import CenterCard from '@/components/centers/CenterCard.vue'
import ReviewList from '@/components/centers/ReviewList.vue'
import TrialRequestCard from '@/components/centers/TrialRequestCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import RatingStars from '@/components/ui/RatingStars.vue'
import Icon from '@/components/ui/Icon.vue'

const route = useRoute()
const auth = useAuthStore()
const ui = useUiStore()

const center = ref(null)
const reviews = ref([])
const similar = ref([])
const loading = ref(true)
const activeTab = ref('about')

const tabs = [
  { id: 'about', label: 'Umumiy' },
  { id: 'teachers', label: "O'qituvchilar" },
  { id: 'reviews', label: 'Sharhlar' },
]

const mainBranch = computed(() => {
  const b = center.value?.branches || []
  return b.find((x) => x.is_main) || b[0] || null
})
const price = computed(() =>
  center.value ? priceRange(center.value.price_from, center.value.price_to) : null
)
const contacts = computed(() => {
  if (!center.value) return []
  const c = center.value
  return [
    c.phone && { icon: 'phone', label: phoneFormat(c.phone), href: `tel:${c.phone}` },
    c.telegram && { icon: 'send', label: c.telegram, href: `https://t.me/${c.telegram.replace('@', '')}` },
    c.instagram && { icon: 'heart', label: c.instagram, href: `https://instagram.com/${c.instagram.replace('@', '')}` },
    c.website && { icon: 'globe', label: c.website.replace(/^https?:\/\//, ''), href: c.website },
  ].filter(Boolean)
})

async function loadAll(slug) {
  loading.value = true
  try {
    center.value = await centersApi.detail(slug)
    ;[reviews.value, similar.value] = await Promise.all([
      reviewsApi.list({ center: center.value.id, page_size: 10 }).then((r) => r.results || r).catch(() => []),
      centersApi.similar(slug).catch(() => []),
    ])
  } catch (e) {
    ui.error(e.message || 'Markaz topilmadi.')
  } finally {
    loading.value = false
  }
}

async function submitReview(payload) {
  if (!auth.isAuthenticated) return ui.openAuth('login')
  try {
    const created = await reviewsApi.create({ center: center.value.id, ...payload })
    reviews.value.unshift(created)
    ui.success('Sharhingiz yuborildi. Moderatsiyadan so\'ng chop etiladi.')
  } catch (e) {
    ui.error(e.message)
  }
}

onMounted(() => loadAll(route.params.slug))
watch(() => route.params.slug, (s) => s && loadAll(s))
</script>

<template>
  <BaseSpinner v-if="loading" center />

  <div v-else-if="center" class="detail">
    <!-- Muqova -->
    <div class="cover">
      <img v-if="center.cover" :src="center.cover" :alt="center.name" />
      <div v-else class="cover__fallback"></div>
      <div class="cover__scrim"></div>
    </div>

    <div class="container">
      <!-- Sarlavha bloki -->
      <div class="head">
        <div class="head__logo">
          <img v-if="center.logo" :src="center.logo" :alt="center.name" />
          <Icon v-else name="building" :size="34" />
        </div>
        <div class="head__main">
          <div class="head__row">
            <h1 class="head__name">{{ center.name }}</h1>
            <BaseBadge v-if="center.verified_at" tone="brand" icon="shield">Tasdiqlangan</BaseBadge>
            <BaseBadge v-if="center.is_featured" tone="gold" icon="sparkles">Premium</BaseBadge>
          </div>
          <p v-if="center.tagline" class="head__tagline">{{ center.tagline }}</p>
          <div class="head__meta">
            <span class="head__rating">
              <Icon name="star" :size="16" class="head__star" />
              <b>{{ ratingText(center.rating) }}</b>
              <span class="muted">({{ center.reviews_count }} sharh)</span>
            </span>
            <span v-if="mainBranch" class="head__loc">
              <Icon name="map-pin" :size="15" /> {{ mainBranch.address }}
            </span>
            <span class="head__students">
              <Icon name="users" :size="15" /> {{ compact(center.students_count) }} o'quvchi
            </span>
          </div>
        </div>
      </div>

      <!-- Yo'nalish chiplari -->
      <div class="dirs">
        <span v-for="d in center.directions_detail" :key="d.id" class="dir-chip">{{ d.name_uz }}</span>
      </div>

      <div class="layout">
        <!-- Chap ustun -->
        <div class="main">
          <div class="tabs">
            <button
              v-for="t in tabs"
              :key="t.id"
              class="tab"
              :class="{ active: activeTab === t.id }"
              @click="activeTab = t.id"
            >
              {{ t.label }}
              <span v-if="t.id === 'reviews'" class="tab__count">{{ center.reviews_count }}</span>
              <span v-if="t.id === 'teachers'" class="tab__count">{{ center.teachers_count }}</span>
            </button>
          </div>

          <!-- Umumiy -->
          <section v-show="activeTab === 'about'" class="pane">
            <h3 class="pane__title">Markaz haqida</h3>
            <p class="about-text">{{ center.description || 'Tavsif hali kiritilmagan.' }}</p>

            <div v-if="center.amenities_detail?.length" class="amenities">
              <h4 class="amenities__title">Qulayliklar</h4>
              <div class="amenities__grid">
                <span v-for="a in center.amenities_detail" :key="a.id" class="amenity">
                  <Icon name="check-circle" :size="16" /> {{ a.name_uz }}
                </span>
              </div>
            </div>

            <div v-if="center.branches?.length" class="branches">
              <h4 class="amenities__title">Filiallar</h4>
              <div v-for="b in center.branches" :key="b.id" class="branch">
                <span class="branch__pin"><Icon name="map-pin" :size="18" /></span>
                <div>
                  <div class="branch__name">{{ b.name }} <span v-if="b.is_main" class="branch__main">asosiy</span></div>
                  <div class="branch__addr">{{ b.address }}</div>
                  <div v-if="b.landmark" class="branch__landmark">Mo'ljal: {{ b.landmark }}</div>
                </div>
                <a v-if="b.phone" :href="`tel:${b.phone}`" class="branch__call">
                  <Icon name="phone" :size="16" />
                </a>
              </div>
            </div>
          </section>

          <!-- O'qituvchilar -->
          <section v-show="activeTab === 'teachers'" class="pane">
            <h3 class="pane__title">O'qituvchilar</h3>
            <div v-if="center.top_teachers?.length" class="teachers">
              <div v-for="t in center.top_teachers" :key="t.id" class="teacher">
                <BaseAvatar :name="t.full_name" :src="t.photo" :size="56" />
                <div class="teacher__info">
                  <div class="teacher__name">{{ t.full_name }}</div>
                  <div class="teacher__exp">{{ t.experience_years }} yil tajriba</div>
                </div>
                <span class="teacher__rating">
                  <Icon name="star" :size="14" class="head__star" /> {{ ratingText(t.rating) }}
                </span>
              </div>
            </div>
            <p v-else class="muted pane__empty">O'qituvchilar ma'lumoti hali qo'shilmagan.</p>
          </section>

          <!-- Sharhlar -->
          <section v-show="activeTab === 'reviews'" class="pane">
            <ReviewList
              :reviews="reviews"
              :breakdown="center.rating_breakdown"
              :rating="center.rating"
              :count="center.reviews_count"
              @submit="submitReview"
            />
          </section>
        </div>

        <!-- O'ng ustun (sticky) -->
        <aside class="side">
          <TrialRequestCard :center="center" :price="price" />

          <div v-if="contacts.length" class="contacts">
            <h4 class="contacts__title">Aloqa</h4>
            <a v-for="c in contacts" :key="c.label" :href="c.href" target="_blank" class="contact">
              <span class="contact__icon"><Icon :name="c.icon" :size="16" /></span>
              {{ c.label }}
            </a>
          </div>
        </aside>
      </div>

      <!-- O'xshash markazlar -->
      <section v-if="similar.length" class="similar">
        <h3 class="pane__title">O'xshash markazlar</h3>
        <div class="grid cols-3">
          <CenterCard v-for="c in similar.slice(0, 3)" :key="c.id" :center="c" />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.cover { height: clamp(200px, 30vw, 320px); position: relative; background: var(--grad-brand-soft); }
.cover img { width: 100%; height: 100%; object-fit: cover; }
.cover__fallback {
  position: absolute; inset: 0;
  background:
    radial-gradient(50% 90% at 15% 15%, rgba(76,172,244,.3), transparent 60%),
    radial-gradient(55% 90% at 88% 10%, rgba(134,200,250,.35), transparent 60%),
    var(--grad-brand-soft);
}
.cover__scrim { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(255,255,255,.0) 100%); }

.head { display: flex; gap: var(--sp-5); margin-top: -48px; position: relative; }
.head__logo {
  width: 104px; height: 104px;
  border-radius: var(--r-lg);
  background: var(--surface);
  border: 3px solid var(--surface);
  box-shadow: var(--shadow-md);
  display: grid; place-items: center;
  overflow: hidden;
  color: var(--sky-500);
  flex-shrink: 0;
}
.head__logo img { width: 100%; height: 100%; object-fit: cover; }
.head__main { padding-top: 54px; }
.head__row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.head__name { font-size: clamp(22px, 3.4vw, 32px); }
.head__tagline { color: var(--text-soft); margin-top: 4px; }
.head__meta { display: flex; flex-wrap: wrap; gap: var(--sp-5); margin-top: var(--sp-3); font-size: 14px; color: var(--text-soft); }
.head__rating, .head__loc, .head__students { display: inline-flex; align-items: center; gap: 6px; }
.head__star { color: var(--gold-500); fill: var(--gold-500); }
.muted { color: var(--text-muted); }

.dirs { display: flex; flex-wrap: wrap; gap: 8px; margin-top: var(--sp-5); }
.dir-chip {
  font-size: 13px; font-weight: 600;
  padding: 6px 12px; border-radius: var(--r-full);
  background: var(--sky-50); color: var(--sky-700);
}

.layout { display: grid; grid-template-columns: 1fr 340px; gap: var(--sp-8); margin-top: var(--sp-8); align-items: start; }

.tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border); margin-bottom: var(--sp-6); }
.tab {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 12px 16px;
  font-weight: 600; font-size: 15px;
  color: var(--text-muted);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color .15s, border-color .15s;
}
.tab:hover { color: var(--sky-700); }
.tab.active { color: var(--sky-700); border-bottom-color: var(--sky-500); }
.tab__count { font-size: 12px; background: var(--sky-100); color: var(--sky-700); padding: 1px 7px; border-radius: var(--r-full); }

.pane__title { font-size: 20px; margin-bottom: var(--sp-4); }
.pane__empty { padding: var(--sp-8) 0; }
.about-text { color: var(--text-soft); line-height: 1.7; white-space: pre-line; }

.amenities, .branches { margin-top: var(--sp-8); }
.amenities__title { font-size: 16px; margin-bottom: var(--sp-4); }
.amenities__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.amenity { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-soft); }
.amenity svg { color: var(--success-500); }

.branch { display: flex; align-items: flex-start; gap: 14px; padding: var(--sp-4); border: 1px solid var(--border); border-radius: var(--r-md); margin-bottom: 10px; }
.branch__pin { width: 40px; height: 40px; display: grid; place-items: center; border-radius: var(--r-sm); background: var(--grad-brand-soft); color: var(--sky-600); flex-shrink: 0; }
.branch__name { font-weight: 700; }
.branch__main { font-size: 11px; font-weight: 600; color: var(--sky-700); background: var(--sky-100); padding: 1px 7px; border-radius: var(--r-full); margin-left: 6px; }
.branch__addr { color: var(--text-soft); font-size: 14px; margin-top: 2px; }
.branch__landmark { color: var(--text-muted); font-size: 13px; margin-top: 2px; }
.branch__call { margin-left: auto; width: 40px; height: 40px; display: grid; place-items: center; border-radius: var(--r-sm); background: var(--sky-50); color: var(--sky-600); }

.teachers { display: flex; flex-direction: column; gap: 10px; }
.teacher { display: flex; align-items: center; gap: 14px; padding: var(--sp-4); border: 1px solid var(--border); border-radius: var(--r-md); }
.teacher__info { flex: 1; }
.teacher__name { font-weight: 700; }
.teacher__exp { font-size: 13px; color: var(--text-muted); }
.teacher__rating { display: inline-flex; align-items: center; gap: 5px; font-weight: 700; font-size: 14px; }

.side { position: sticky; top: calc(var(--header-h) + 16px); display: flex; flex-direction: column; gap: var(--sp-5); }
.contacts { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--sp-5); box-shadow: var(--shadow-sm); }
.contacts__title { font-size: 15px; margin-bottom: var(--sp-3); }
.contact { display: flex; align-items: center; gap: 10px; padding: 9px 0; font-size: 14px; color: var(--text-soft); font-weight: 500; }
.contact:hover { color: var(--sky-700); }
.contact__icon { width: 32px; height: 32px; display: grid; place-items: center; border-radius: var(--r-sm); background: var(--sky-50); color: var(--sky-600); }

.similar { margin-top: var(--sp-16); }

@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .side { position: static; }
}
@media (max-width: 560px) {
  .head { flex-direction: column; gap: var(--sp-3); }
  .head__main { padding-top: 0; }
  .amenities__grid { grid-template-columns: 1fr; }
}
</style>
