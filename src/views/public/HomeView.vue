<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { centersApi, catalogApi } from '@/api'
import { compact } from '@/lib/format'
import CenterCard from '@/components/centers/CenterCard.vue'
import DirectionCard from '@/components/centers/DirectionCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import Icon from '@/components/ui/Icon.vue'

const router = useRouter()

const query = ref('')
const featured = ref([])
const directions = ref([])
const loadingFeatured = ref(true)
const loadingDirs = ref(true)

const stats = [
  { value: '1 200+', label: "O'quv markazlari" },
  { value: '85 000+', label: "O'quvchilar" },
  { value: '14', label: 'Viloyat' },
  { value: '4,8', label: "O'rtacha reyting" },
]

const steps = [
  { icon: 'search', title: 'Qidiring', text: "Hudud, yo'nalish va narx bo'yicha o'zingizga mos markazni toping." },
  { icon: 'star', title: 'Taqqoslang', text: 'Haqiqiy sharhlar, reyting va natijalar asosida ishonch bilan tanlang.' },
  { icon: 'graduation-cap', title: 'Yoziling', text: "To'g'ridan-to'g'ri sinov darsiga yoziling — bir necha tugma orqali." },
]

function search() {
  router.push({ name: 'centers', query: query.value ? { search: query.value } : {} })
}

onMounted(async () => {
  try {
    featured.value = await centersApi.featured()
  } finally {
    loadingFeatured.value = false
  }
  try {
    const res = await catalogApi.directions({ is_popular: true, page_size: 8 })
    directions.value = res.results || res
  } finally {
    loadingDirs.value = false
  }
})
</script>

<template>
  <div>
    <!-- ===== HERO ===== -->
    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__badge anim-fade-up">
          <Icon name="sparkles" :size="15" />
          O'zbekistonning yagona ta'lim platformasi
        </div>

        <h1 class="hero__title anim-fade-up" style="animation-delay:.05s">
          Farzandingizga eng mos<br />
          o'quv markazni <span class="grad-text">bir joydan</span> toping
        </h1>

        <p class="hero__lead anim-fade-up" style="animation-delay:.1s">
          Reyting, sharhlar va real natijalar asosida shaffof tanlov.
          Qo'qondan boshlab — butun O'zbekiston bo'ylab.
        </p>

        <div class="hero__search anim-fade-up" style="animation-delay:.15s">
          <div class="searchbar">
            <Icon name="search" :size="20" class="searchbar__icon" />
            <input
              v-model="query"
              type="text"
              placeholder="Ingliz tili, IT, matematika, IELTS..."
              @keyup.enter="search"
            />
            <BaseButton class="searchbar__btn" @click="search">Qidirish</BaseButton>
          </div>
          <div class="hero__tags">
            <span class="hero__tags-label">Ommabop:</span>
            <RouterLink :to="{ name: 'centers', query: { search: 'Ingliz tili' } }">Ingliz tili</RouterLink>
            <RouterLink :to="{ name: 'centers', query: { search: 'IT' } }">IT / dasturlash</RouterLink>
            <RouterLink :to="{ name: 'centers', query: { search: 'Matematika' } }">Matematika</RouterLink>
            <RouterLink :to="{ name: 'centers', query: { search: 'IELTS' } }">IELTS</RouterLink>
          </div>
        </div>

        <div class="hero__stats anim-fade-up" style="animation-delay:.2s">
          <div v-for="s in stats" :key="s.label" class="hero__stat">
            <div class="hero__stat-val tabular">{{ s.value }}</div>
            <div class="hero__stat-lbl">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== YO'NALISHLAR ===== -->
    <section class="section container">
      <div class="sec-head">
        <div>
          <span class="eyebrow"><Icon name="book-open" :size="14" /> Yo'nalishlar</span>
          <h2 class="section-title">Nimani o'rganmoqchisiz?</h2>
        </div>
        <RouterLink :to="{ name: 'directions' }">
          <BaseButton variant="ghost" icon-right="arrow-right">Barchasi</BaseButton>
        </RouterLink>
      </div>

      <div class="grid cols-4">
        <template v-if="loadingDirs">
          <BaseSkeleton v-for="i in 8" :key="i" h="84px" radius="var(--r-lg)" />
        </template>
        <DirectionCard v-for="d in directions" v-else :key="d.id" :direction="d" />
      </div>
    </section>

    <!-- ===== TAVSIYA MARKAZLAR ===== -->
    <section class="section container">
      <div class="sec-head">
        <div>
          <span class="eyebrow"><Icon name="award" :size="14" /> Tavsiya etilgan</span>
          <h2 class="section-title">Eng yuqori baholangan markazlar</h2>
        </div>
        <RouterLink :to="{ name: 'centers' }">
          <BaseButton variant="ghost" icon-right="arrow-right">Barchasi</BaseButton>
        </RouterLink>
      </div>

      <div class="grid cols-3">
        <template v-if="loadingFeatured">
          <BaseSkeleton v-for="i in 6" :key="i" h="300px" radius="var(--r-lg)" />
        </template>
        <CenterCard v-for="c in featured" v-else :key="c.id" :center="c" />
      </div>

      <div v-if="!loadingFeatured && !featured.length" class="empty-band">
        <Icon name="sparkles" :size="22" />
        Tez orada bu yerda eng yaxshi markazlar paydo bo'ladi.
      </div>
    </section>

    <!-- ===== QANDAY ISHLAYDI ===== -->
    <section class="section how">
      <div class="container">
        <div class="how__head">
          <span class="eyebrow"><Icon name="sparkles" :size="14" /> Oddiy 3 qadam</span>
          <h2 class="section-title">Qanday ishlaydi?</h2>
        </div>
        <div class="grid cols-3 how__grid">
          <div v-for="(s, i) in steps" :key="s.title" class="how__card">
            <div class="how__num">0{{ i + 1 }}</div>
            <span class="how__icon"><Icon :name="s.icon" :size="24" /></span>
            <h3>{{ s.title }}</h3>
            <p>{{ s.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== MARKAZLAR UCHUN CTA ===== -->
    <section class="section container">
      <div class="cta">
        <div class="cta__mesh"></div>
        <div class="cta__content">
          <span class="eyebrow" style="color:var(--sky-200)"><Icon name="building" :size="14" /> Markazlar uchun</span>
          <h2 class="cta__title">O'quv markazingizni raqamlashtiring</h2>
          <p class="cta__text">
            Bepul ro'yxatdan o'ting, yangi o'quvchilar oling, CRM va reyting tizimidan
            foydalaning. Butun boshqaruv — bitta panelda.
          </p>
          <div class="cta__actions">
            <RouterLink :to="{ name: 'center-onboard' }">
              <BaseButton size="lg" variant="secondary" icon-right="arrow-right">Markaz qo'shish</BaseButton>
            </RouterLink>
            <div class="cta__points">
              <span><Icon name="check" :size="16" /> Bepul boshlang</span>
              <span><Icon name="check" :size="16" /> CRM va analitika</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* HERO */
.hero {
  position: relative;
  background: var(--grad-mesh);
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}
.hero__inner {
  padding-block: clamp(48px, 8vw, 104px) clamp(40px, 6vw, 80px);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hero__badge {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 7px 15px;
  border-radius: var(--r-full);
  background: rgba(255,255,255,.7);
  border: 1px solid var(--sky-200);
  color: var(--sky-700);
  font-size: 13.5px; font-weight: 600;
  box-shadow: var(--shadow-xs);
}
.hero__title {
  margin-top: var(--sp-6);
  font-size: clamp(32px, 6vw, 60px);
  line-height: 1.06;
  letter-spacing: -0.03em;
}
.hero__lead {
  margin-top: var(--sp-5);
  max-width: 56ch;
  font-size: clamp(16px, 2vw, 19px);
  color: var(--text-soft);
}
.hero__search { margin-top: var(--sp-8); width: 100%; max-width: 680px; }
.searchbar {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-full);
  padding: 8px 8px 8px 18px;
  box-shadow: var(--shadow-lg);
}
.searchbar__icon { color: var(--text-muted); flex-shrink: 0; }
.searchbar input {
  flex: 1;
  height: 44px;
  border: none;
  background: none;
  font-size: 16px;
  color: var(--text);
}
.searchbar input:focus { outline: none; }
.searchbar__btn { border-radius: var(--r-full) !important; }
.hero__tags {
  display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;
  margin-top: var(--sp-4); font-size: 13.5px;
}
.hero__tags-label { color: var(--text-muted); }
.hero__tags a { color: var(--sky-700); font-weight: 600; }
.hero__tags a:hover { text-decoration: underline; }

.hero__stats {
  display: flex; flex-wrap: wrap; gap: clamp(24px, 5vw, 64px); justify-content: center;
  margin-top: var(--sp-12);
  padding-top: var(--sp-8);
  border-top: 1px solid var(--sky-100);
  width: 100%;
  max-width: 760px;
}
.hero__stat-val {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(26px, 4vw, 40px);
  letter-spacing: -0.03em;
  background: var(--grad-brand);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero__stat-lbl { font-size: 13.5px; color: var(--text-muted); margin-top: 2px; }

/* Bo'lim sarlavhalari */
.sec-head {
  display: flex; align-items: flex-end; justify-content: space-between; gap: var(--sp-4);
  margin-bottom: var(--sp-8);
}

.empty-band {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: var(--sp-12); color: var(--text-muted);
  background: var(--grad-surface); border: 1px dashed var(--border-strong);
  border-radius: var(--r-lg); color: var(--sky-600);
}

/* Qanday ishlaydi */
.how { background: var(--grad-surface); border-block: 1px solid var(--border); }
.how__head { text-align: center; margin-bottom: var(--sp-10); display: flex; flex-direction: column; align-items: center; }
.how__grid { position: relative; }
.how__card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--sp-8) var(--sp-6);
  position: relative;
  box-shadow: var(--shadow-sm);
}
.how__num {
  position: absolute; top: var(--sp-5); right: var(--sp-6);
  font-family: var(--font-display); font-weight: 800; font-size: 34px;
  color: var(--sky-100);
}
.how__icon {
  width: 56px; height: 56px;
  display: grid; place-items: center;
  border-radius: var(--r-md);
  background: var(--grad-brand);
  color: #fff;
  box-shadow: var(--shadow-brand);
  margin-bottom: var(--sp-5);
}
.how__card h3 { font-size: 19px; }
.how__card p { margin-top: 8px; color: var(--text-soft); font-size: 14.5px; }

/* CTA */
.cta {
  position: relative;
  border-radius: var(--r-xl);
  background: var(--grad-deep);
  padding: clamp(36px, 5vw, 64px);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}
.cta__mesh {
  position: absolute; inset: 0;
  background:
    radial-gradient(50% 80% at 85% 20%, rgba(76,172,244,.4), transparent 60%),
    radial-gradient(40% 70% at 10% 90%, rgba(18,114,196,.5), transparent 60%);
}
.cta__content { position: relative; max-width: 640px; }
.cta__title { color: #fff; font-size: clamp(24px, 3.5vw, 36px); margin-top: var(--sp-3); }
.cta__text { color: #B9DFFD; margin-top: var(--sp-4); font-size: 16px; line-height: 1.6; }
.cta__actions { display: flex; align-items: center; gap: var(--sp-6); margin-top: var(--sp-8); flex-wrap: wrap; }
.cta__points { display: flex; flex-direction: column; gap: 8px; }
.cta__points span { display: inline-flex; align-items: center; gap: 8px; color: #DCEFFE; font-size: 14px; font-weight: 500; }
.cta__points svg { color: var(--sky-300); }

@media (max-width: 620px) {
  .searchbar { flex-wrap: wrap; border-radius: var(--r-lg); padding: 12px; }
  .searchbar input { width: 100%; }
  .searchbar__btn { width: 100%; }
  .sec-head { flex-direction: column; align-items: flex-start; }
}
</style>
