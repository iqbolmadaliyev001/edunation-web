<script setup>
import Icon from '@/components/ui/Icon.vue'

const phases = [
  { period: '1–3 oy', title: 'Qo\'qon — pilot', text: '10+ markaz bilan integratsiya, bepul ro\'yxatdan o\'tish, CRM va reyting sinovi.' },
  { period: '4–6 oy', title: 'Viloyatlar', text: 'Farg\'ona, Andijon, Namangan, Toshkent. O\'qituvchilar reytingi qo\'shiladi.' },
  { period: '6–12 oy', title: 'Butun O\'zbekiston', text: 'Har viloyatda rasmiy vakillar, to\'lovli obuna, media kampaniyalar.' },
  { period: '1–2 yil', title: 'Xalqaro chiqish', text: 'Qozog\'iston, Qirg\'iziston, Tojikiston. Ingliz va rus tilidagi versiyalar.' },
]
const values = [
  { icon: 'shield', title: 'Shaffoflik', text: 'Har bir reyting real sharh va natijalarga asoslanadi. Sotib olib bo\'lmaydi.' },
  { icon: 'trending-up', title: 'Sifat', text: 'Markazlar bir-biri bilan raqobatlashadi — yutadigan tomon o\'quvchi.' },
  { icon: 'globe', title: 'Qamrov', text: 'Bitta tugma orqali butun mamlakat bo\'ylab markazlarni topish.' },
]
</script>

<template>
  <div class="about">
    <!-- Hero -->
    <section class="hero">
      <div class="container hero__inner">
        <span class="eyebrow"><Icon name="sparkles" :size="14" /> Biz haqimizda</span>
        <h1 class="hero__title">Bilim <span class="grad-text">birlashtiradi</span></h1>
        <p class="hero__lead">
          EduNation — O'zbekiston bo'ylab barcha o'quv markazlarni yagona professional
          IT platformada birlashtirib, ta'lim sifatini, shaffoflikni va raqamli
          boshqaruvni yangi bosqichga olib chiqadi.
        </p>
      </div>
    </section>

    <!-- Missiya / Vizyon -->
    <section class="section container">
      <div class="grid cols-2 mv">
        <div class="mv__card">
          <span class="mv__icon"><Icon name="send" :size="22" /></span>
          <h3>Missiya</h3>
          <p>
            O'quv markazlarni yagona platformada birlashtirish, ta'lim sifati va
            shaffoflikni oshirish, ota-onalarga ishonchli tanlov berish.
          </p>
        </div>
        <div class="mv__card">
          <span class="mv__icon"><Icon name="eye" :size="22" /></span>
          <h3>Vizyon</h3>
          <p>
            Har bir markazni bir tugma orqali topib, baholab, farzandini ishonch bilan
            yuborish mumkin bo'lgan yagona milliy ta'lim platformasiga aylanish.
          </p>
        </div>
      </div>
    </section>

    <!-- Qadriyatlar -->
    <section class="section values">
      <div class="container">
        <div class="sec-center">
          <h2 class="section-title">Nimaga ishonamiz</h2>
        </div>
        <div class="grid cols-3">
          <div v-for="v in values" :key="v.title" class="value">
            <span class="value__icon"><Icon :name="v.icon" :size="22" /></span>
            <h3>{{ v.title }}</h3>
            <p>{{ v.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Yo'l xaritasi -->
    <section class="section container">
      <div class="sec-center">
        <span class="eyebrow"><Icon name="map-pin" :size="14" /> Strategiya</span>
        <h2 class="section-title">Rivojlanish bosqichlari</h2>
      </div>
      <div class="roadmap">
        <div v-for="(p, i) in phases" :key="i" class="phase">
          <div class="phase__dot">{{ i + 1 }}</div>
          <div class="phase__body">
            <span class="phase__period">{{ p.period }}</span>
            <h3>{{ p.title }}</h3>
            <p>{{ p.text }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero { background: var(--grad-mesh); border-bottom: 1px solid var(--border); }
.hero__inner { padding-block: clamp(48px, 8vw, 88px); text-align: center; display: flex; flex-direction: column; align-items: center; }
.hero__title { font-size: clamp(34px, 6vw, 60px); margin-top: var(--sp-4); }
.hero__lead { max-width: 60ch; margin-top: var(--sp-5); font-size: 18px; color: var(--text-soft); }

.mv { gap: var(--sp-6); }
.mv__card { padding: var(--sp-8); border: 1px solid var(--border); border-radius: var(--r-xl); background: var(--grad-surface); box-shadow: var(--shadow-sm); }
.mv__icon { display: inline-grid; place-items: center; width: 52px; height: 52px; border-radius: var(--r-md); background: var(--grad-brand); color: #fff; box-shadow: var(--shadow-brand); margin-bottom: var(--sp-4); }
.mv__card h3 { font-size: 22px; }
.mv__card p { margin-top: var(--sp-3); color: var(--text-soft); line-height: 1.65; }

.values { background: var(--grad-surface); border-block: 1px solid var(--border); }
.sec-center { text-align: center; margin-bottom: var(--sp-10); display: flex; flex-direction: column; align-items: center; }
.value { text-align: center; padding: var(--sp-6); }
.value__icon { display: inline-grid; place-items: center; width: 56px; height: 56px; border-radius: var(--r-lg); background: var(--grad-brand-soft); color: var(--sky-600); margin-bottom: var(--sp-4); }
.value h3 { font-size: 19px; }
.value p { margin-top: 8px; color: var(--text-soft); font-size: 14.5px; }

.roadmap { max-width: 760px; margin: 0 auto; }
.phase { display: flex; gap: var(--sp-5); padding-bottom: var(--sp-8); position: relative; }
.phase:not(:last-child)::before { content: ''; position: absolute; left: 21px; top: 44px; bottom: 0; width: 2px; background: var(--sky-100); }
.phase__dot { width: 44px; height: 44px; flex-shrink: 0; display: grid; place-items: center; border-radius: 50%; background: var(--grad-brand); color: #fff; font-weight: 700; box-shadow: var(--shadow-brand); z-index: 1; }
.phase__period { font-size: 12.5px; font-weight: 700; color: var(--sky-600); text-transform: uppercase; letter-spacing: 0.03em; }
.phase__body h3 { font-size: 19px; margin-top: 2px; }
.phase__body p { color: var(--text-soft); margin-top: 6px; }
</style>
