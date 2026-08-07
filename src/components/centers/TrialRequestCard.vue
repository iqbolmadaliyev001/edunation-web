<script setup>
import { ref, reactive } from 'vue'
import { crmApi } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import Icon from '@/components/ui/Icon.vue'

const props = defineProps({
  center: { type: Object, required: true },
  price: { type: [String, null], default: null },
})

const auth = useAuthStore()
const ui = useUiStore()

const sent = ref(false)
const loading = ref(false)
const form = reactive({
  name: auth.user?.first_name || '',
  phone: auth.user?.phone || '+998',
  note: '',
})

async function submit() {
  if (!form.name.trim()) return ui.error('Ismingizni kiriting.')
  if (!/^\+998\d{9}$/.test(form.phone)) return ui.error('Telefon +998XXXXXXXXX ko\'rinishida.')
  loading.value = true
  try {
    await crmApi.trialRequest({
      center: props.center.id,
      full_name: form.name.trim(),
      phone: form.phone,
      comment: form.note,
    })
    sent.value = true
    ui.success('So\'rovingiz yuborildi! Markaz tez orada bog\'lanadi.')
  } catch (e) {
    ui.error(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="trial">
    <div class="trial__glow"></div>
    <div class="trial__inner">
      <div v-if="price" class="trial__price">
        <span class="trial__price-val">{{ price }}</span>
        <span class="trial__price-suf">/ oy</span>
      </div>
      <p v-else class="trial__price-empty">Narx markaz bilan kelishiladi</p>

      <template v-if="!sent">
        <h4 class="trial__title">Bepul sinov darsiga yoziling</h4>
        <p class="trial__sub">Ma'lumotlaringizni qoldiring — markaz siz bilan bog'lanadi.</p>

        <div class="trial__form">
          <BaseInput v-model="form.name" placeholder="Ismingiz" icon="user" />
          <BaseInput v-model="form.phone" placeholder="+998 90 123 45 67" icon="phone" inputmode="tel" />
        </div>

        <BaseButton block size="lg" icon="graduation-cap" :loading="loading" @click="submit">
          Sinov darsiga yozilish
        </BaseButton>
        <p class="trial__fine">Bepul va hech qanday majburiyatsiz</p>
      </template>

      <div v-else class="trial__done">
        <span class="trial__check"><Icon name="check-circle" :size="30" /></span>
        <h4>So'rovingiz qabul qilindi!</h4>
        <p>Markaz administratori tez orada bog'lanadi.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trial {
  position: relative;
  border-radius: var(--r-lg);
  overflow: hidden;
  background: var(--grad-deep);
  box-shadow: var(--shadow-md);
}
.trial__glow {
  position: absolute; inset: 0;
  background: radial-gradient(60% 60% at 80% 0%, rgba(76,172,244,.4), transparent 60%);
}
.trial__inner { position: relative; padding: var(--sp-6); }
.trial__price { display: flex; align-items: baseline; gap: 6px; }
.trial__price-val { font-family: var(--font-display); font-weight: 800; font-size: 26px; color: #fff; letter-spacing: -0.02em; }
.trial__price-suf { color: var(--sky-200); font-size: 14px; }
.trial__price-empty { color: var(--sky-100); font-weight: 600; }
.trial__title { color: #fff; font-size: 18px; margin-top: var(--sp-4); }
.trial__sub { color: #B9DFFD; font-size: 13.5px; margin-top: 6px; }
.trial__form { display: flex; flex-direction: column; gap: 10px; margin: var(--sp-5) 0; }
.trial__form :deep(input) { background: rgba(255,255,255,.95); border-color: transparent; }
.trial__fine { text-align: center; color: var(--sky-200); font-size: 12px; margin-top: 10px; }

.trial__done { text-align: center; padding: var(--sp-4) 0; }
.trial__check { display: inline-grid; place-items: center; width: 60px; height: 60px; border-radius: 50%; background: rgba(22,163,123,.2); color: #6EE7B7; margin-bottom: var(--sp-3); }
.trial__done h4 { color: #fff; font-size: 18px; }
.trial__done p { color: #B9DFFD; font-size: 14px; margin-top: 6px; }
</style>
