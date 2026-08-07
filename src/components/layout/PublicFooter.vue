<script setup>
import { RouterLink } from 'vue-router'
import BrandLogo from './BrandLogo.vue'
import Icon from '@/components/ui/Icon.vue'

const year = new Date().getFullYear()
const cols = [
  {
    title: 'Platforma',
    links: [
      { label: 'Markazlar', to: { name: 'centers' } },
      { label: "Yo'nalishlar", to: { name: 'directions' } },
      { label: 'Biz haqimizda', to: { name: 'about' } },
    ],
  },
  {
    title: 'Markazlar uchun',
    links: [
      { label: 'Markaz ochish', to: { name: 'center-onboard' } },
      { label: 'Narxlar', to: { name: 'center-onboard' } },
    ],
  },
]
</script>

<template>
  <footer class="ft">
    <div class="container ft__inner">
      <div class="ft__brand">
        <BrandLogo :size="38" light />
        <p class="ft__tag">
          Bilim birlashtiradi. O'zbekiston o'quv markazlarini yagona professional
          platformada birlashtiruvchi milliy ta'lim tizimi.
        </p>
        <div class="ft__social">
          <a href="#" aria-label="Telegram"><Icon name="send" :size="18" /></a>
          <a href="#" aria-label="Instagram"><Icon name="heart" :size="18" /></a>
          <a href="#" aria-label="Website"><Icon name="globe" :size="18" /></a>
        </div>
      </div>

      <div class="ft__cols">
        <div v-for="c in cols" :key="c.title" class="ft__col">
          <h4>{{ c.title }}</h4>
          <RouterLink v-for="l in c.links" :key="l.label" :to="l.to" class="ft__link">
            {{ l.label }}
          </RouterLink>
        </div>
        <div class="ft__col">
          <h4>Aloqa</h4>
          <a class="ft__link" href="tel:+998950000000">+998 95 000 00 00</a>
          <a class="ft__link" href="mailto:hello@edunation.uz">hello@edunation.uz</a>
          <span class="ft__link">Qo'qon, O'zbekiston</span>
        </div>
      </div>
    </div>

    <div class="ft__bottom">
      <div class="container ft__bottom-inner">
        <span>© {{ year }} EduNation. Barcha huquqlar himoyalangan.</span>
        <div class="ft__legal">
          <a href="#">Maxfiylik</a>
          <a href="#">Shartlar</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.ft { background: var(--grad-deep); color: #CFE3F3; margin-top: var(--sp-20); }
.ft__inner {
  display: grid;
  grid-template-columns: 1.4fr 2fr;
  gap: var(--sp-16);
  padding-block: var(--sp-16);
}
.ft__tag { margin-top: var(--sp-4); font-size: 14px; line-height: 1.6; color: #A9C9E4; max-width: 40ch; }
.ft__social { display: flex; gap: 10px; margin-top: var(--sp-5); }
.ft__social a {
  width: 38px; height: 38px;
  display: grid; place-items: center;
  border-radius: var(--r-sm);
  background: rgba(255,255,255,.08);
  color: #DCEFFE;
  transition: background .15s;
}
.ft__social a:hover { background: rgba(255,255,255,.16); }

.ft__cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-8); }
.ft__col h4 { color: #fff; font-size: 14px; margin-bottom: var(--sp-4); font-family: var(--font-body); font-weight: 700; letter-spacing: 0; }
.ft__link { display: block; padding: 6px 0; font-size: 14px; color: #A9C9E4; transition: color .15s; }
.ft__link:hover { color: #fff; }

.ft__bottom { border-top: 1px solid rgba(255,255,255,.1); }
.ft__bottom-inner {
  display: flex; align-items: center; justify-content: space-between;
  padding-block: var(--sp-5);
  font-size: 13px; color: #89A9C4;
}
.ft__legal { display: flex; gap: var(--sp-5); }
.ft__legal a:hover { color: #fff; }

@media (max-width: 860px) {
  .ft__inner { grid-template-columns: 1fr; gap: var(--sp-10); }
  .ft__cols { grid-template-columns: repeat(2, 1fr); gap: var(--sp-6); }
}
@media (max-width: 520px) {
  .ft__bottom-inner { flex-direction: column; gap: 10px; }
}
</style>
