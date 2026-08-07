<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import Icon from '@/components/ui/Icon.vue'

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

const benefits = [
  { icon: 'users', title: 'Yangi o\'quvchilar', text: 'Platforma orqali kelayotgan lidlar to\'g\'ridan-to\'g\'ri CRM\'ingizga tushadi.' },
  { icon: 'chart', title: 'CRM va analitika', text: 'Lidlar, guruhlar, davomat, to\'lovlar va o\'sish ko\'rsatkichlari bir panelda.' },
  { icon: 'star', title: 'Shaffof reyting', text: 'Real sharhlar orqali obro\' qozoning — sifat o\'zini ko\'rsatadi.' },
  { icon: 'credit-card', title: 'To\'lov nazorati', text: 'O\'quvchilar to\'lovlarini kuzating, qarzdorlarni avtomatik aniqlang.' },
]
const plans = [
  { name: 'Bepul', price: '0', period: 'boshlash uchun', features: ['Markaz profili', 'Sharh va reyting', '5 tagacha kurs'], cta: 'Bepul boshlash', highlight: false },
  { name: 'Pro', price: '500 000', period: "oyiga so'm", features: ['To\'liq CRM', 'Cheksiz kurs va guruh', 'Analitika va hisobotlar', 'Premium joylashuv'], cta: 'Pro tanlash', highlight: true },
  { name: 'Biznes', price: '2 000 000', period: "oyiga so'm", features: ['Bir nechta filial', 'Xodimlar boshqaruvi', 'Ustuvor qo\'llab-quvvatlash', 'API integratsiya'], cta: 'Bog\'lanish', highlight: false },
]

const isCenter = computed(() => auth.isCenterSide || auth.isAdmin)

function start() {
  if (!auth.isAuthenticated) {
    ui.openAuth('login')
    return
  }
  if (isCenter.value) {
    router.push({ name: 'center-dashboard' })
  } else {
    ui.toast('Markaz egasi sifatida qayta ro\'yxatdan o\'ting yoki qo\'llab-quvvatlashga murojaat qiling.', 'info', 6000)
  }
}
</script>

<template>
  <div class="onb">
    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__text">
          <span class="eyebrow"><Icon name="building" :size="14" /> Markazlar uchun</span>
          <h1 class="hero__title">O'quv markazingizni <span class="grad-text">raqamlashtiring</span></h1>
          <p class="hero__lead">
            Bepul ro'yxatdan o'ting, yangi o'quvchilar oling va butun boshqaruvni
            bitta zamonaviy paneldan olib boring.
          </p>
          <div class="hero__actions">
            <BaseButton size="lg" icon-right="arrow-right" @click="start">
              {{ isCenter ? 'Panelga o\'tish' : 'Bepul boshlash' }}
            </BaseButton>
            <div class="hero__trust">
              <Icon name="check-circle" :size="18" /> 1 200+ markaz ishonadi
            </div>
          </div>
        </div>
        <div class="hero__panel">
          <div class="mock">
            <div class="mock__bar"><span></span><span></span><span></span></div>
            <div class="mock__row"><div class="mock__stat" v-for="i in 3" :key="i"></div></div>
            <div class="mock__chart"></div>
            <div class="mock__line" v-for="i in 3" :key="'l'+i"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section container">
      <div class="grid cols-2 benefits">
        <div v-for="b in benefits" :key="b.title" class="benefit">
          <span class="benefit__icon"><Icon :name="b.icon" :size="22" /></span>
          <div>
            <h3>{{ b.title }}</h3>
            <p>{{ b.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section pricing">
      <div class="container">
        <div class="sec-center">
          <span class="eyebrow"><Icon name="credit-card" :size="14" /> Tariflar</span>
          <h2 class="section-title">O'zingizga mos rejani tanlang</h2>
        </div>
        <div class="grid cols-3">
          <div v-for="p in plans" :key="p.name" class="plan" :class="{ 'plan--hl': p.highlight }">
            <div v-if="p.highlight" class="plan__badge">Ommabop</div>
            <h3 class="plan__name">{{ p.name }}</h3>
            <div class="plan__price">
              <span class="plan__price-val tabular">{{ p.price }}</span>
              <span class="plan__price-per">{{ p.period }}</span>
            </div>
            <ul class="plan__features">
              <li v-for="f in p.features" :key="f"><Icon name="check" :size="16" /> {{ f }}</li>
            </ul>
            <BaseButton :variant="p.highlight ? 'primary' : 'secondary'" block @click="start">
              {{ p.cta }}
            </BaseButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero { background: var(--grad-mesh); border-bottom: 1px solid var(--border); }
.hero__inner { display: grid; grid-template-columns: 1.1fr 1fr; gap: var(--sp-12); align-items: center; padding-block: clamp(48px, 7vw, 88px); }
.hero__title { font-size: clamp(30px, 5vw, 52px); margin-top: var(--sp-4); line-height: 1.08; }
.hero__lead { font-size: 18px; color: var(--text-soft); margin-top: var(--sp-5); max-width: 46ch; }
.hero__actions { display: flex; align-items: center; gap: var(--sp-5); margin-top: var(--sp-8); flex-wrap: wrap; }
.hero__trust { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: var(--sky-700); }

.hero__panel { display: grid; place-items: center; }
.mock { width: 100%; max-width: 380px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-xl); box-shadow: var(--shadow-xl); padding: var(--sp-5); }
.mock__bar { display: flex; gap: 6px; margin-bottom: var(--sp-5); }
.mock__bar span { width: 10px; height: 10px; border-radius: 50%; background: var(--sky-200); }
.mock__bar span:first-child { background: var(--sky-500); }
.mock__row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: var(--sp-5); }
.mock__stat { height: 56px; border-radius: var(--r-md); background: var(--grad-brand-soft); }
.mock__chart { height: 110px; border-radius: var(--r-md); background: linear-gradient(180deg, var(--sky-100), transparent), var(--surface); border: 1px solid var(--border); margin-bottom: var(--sp-4); position: relative; overflow: hidden; }
.mock__chart::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 60%; background: var(--grad-brand); opacity: .12; clip-path: polygon(0 100%, 15% 60%, 35% 75%, 55% 35%, 75% 55%, 100% 20%, 100% 100%); }
.mock__line { height: 12px; border-radius: 999px; background: var(--ink-100); margin-bottom: 10px; }
.mock__line:nth-child(odd) { width: 80%; }

.benefits { gap: var(--sp-5); }
.benefit { display: flex; gap: var(--sp-4); padding: var(--sp-5); border: 1px solid var(--border); border-radius: var(--r-lg); background: var(--surface); box-shadow: var(--shadow-xs); }
.benefit__icon { flex-shrink: 0; width: 48px; height: 48px; display: grid; place-items: center; border-radius: var(--r-md); background: var(--grad-brand); color: #fff; box-shadow: var(--shadow-brand); }
.benefit h3 { font-size: 17px; }
.benefit p { color: var(--text-soft); font-size: 14.5px; margin-top: 4px; }

.pricing { background: var(--grad-surface); border-block: 1px solid var(--border); }
.sec-center { text-align: center; margin-bottom: var(--sp-10); display: flex; flex-direction: column; align-items: center; }
.plan { position: relative; padding: var(--sp-8) var(--sp-6); background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-xl); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; }
.plan--hl { border-color: var(--sky-300); box-shadow: var(--shadow-lg); transform: translateY(-6px); }
.plan__badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--grad-brand); color: #fff; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: var(--r-full); box-shadow: var(--shadow-brand); }
.plan__name { font-size: 20px; }
.plan__price { display: flex; align-items: baseline; gap: 6px; margin: var(--sp-4) 0; }
.plan__price-val { font-family: var(--font-display); font-weight: 800; font-size: 30px; color: var(--ink-800); }
.plan__price-per { font-size: 13px; color: var(--text-muted); }
.plan__features { flex: 1; display: flex; flex-direction: column; gap: 10px; margin-bottom: var(--sp-6); }
.plan__features li { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-soft); }
.plan__features svg { color: var(--success-500); flex-shrink: 0; }

@media (max-width: 860px) {
  .hero__inner { grid-template-columns: 1fr; }
  .hero__panel { order: -1; }
}
</style>
