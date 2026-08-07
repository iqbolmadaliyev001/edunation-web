<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { centersApi } from '@/api'
import { useCenterStore } from '@/stores/center'
import { useUiStore } from '@/stores/ui'
import PageHeader from '@/components/panel/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import Icon from '@/components/ui/Icon.vue'

const centerStore = useCenterStore()
const ui = useUiStore()
const loading = ref(true)
const saving = ref(false)
const detail = ref(null)

const form = reactive({
  name: '', tagline: '', description: '',
  phone: '', email: '', website: '', telegram: '', instagram: '',
  founded_year: '',
})

async function load() {
  if (!centerStore.active) return
  loading.value = true
  try {
    detail.value = await centersApi.detail(centerStore.active.slug)
    Object.keys(form).forEach((k) => { form[k] = detail.value[k] ?? '' })
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    await centersApi.update(detail.value.slug, { ...form, founded_year: form.founded_year || null })
    ui.success('Ma\'lumotlar saqlandi.')
    centerStore.load(true)
  } catch (e) {
    ui.error(e.message)
  } finally {
    saving.value = false
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
    <PageHeader title="Sozlamalar" subtitle="Markaz profilini tahrirlang — o'zgarishlar saytda ko'rinadi">
      <template #actions>
        <BaseButton icon="check" :loading="saving" @click="save">Saqlash</BaseButton>
      </template>
    </PageHeader>

    <BaseSpinner v-if="loading" center />

    <div v-else class="settings">
      <section class="card">
        <h3 class="card__title"><Icon name="building" :size="18" /> Asosiy ma'lumot</h3>
        <div class="form-grid">
          <BaseInput v-model="form.name" label="Markaz nomi" />
          <BaseInput v-model="form.founded_year" label="Tashkil etilgan yil" inputmode="numeric" />
          <div class="span-2">
            <BaseInput v-model="form.tagline" label="Shior" placeholder="Qisqa jozibali shior" />
          </div>
          <div class="span-2">
            <label class="field">
              <span class="field__label">Tavsif</span>
              <textarea v-model="form.description" rows="5" placeholder="Markaz haqida batafsil..."></textarea>
            </label>
          </div>
        </div>
      </section>

      <section class="card">
        <h3 class="card__title"><Icon name="phone" :size="18" /> Aloqa</h3>
        <div class="form-grid">
          <BaseInput v-model="form.phone" label="Telefon" icon="phone" inputmode="tel" />
          <BaseInput v-model="form.email" label="Email" icon="mail" type="email" />
          <BaseInput v-model="form.website" label="Veb-sayt" icon="globe" />
          <BaseInput v-model="form.telegram" label="Telegram" icon="send" placeholder="@username" />
          <BaseInput v-model="form.instagram" label="Instagram" icon="heart" placeholder="username" />
        </div>
      </section>

      <div class="settings__foot">
        <BaseButton size="lg" icon="check" :loading="saving" @click="save">O'zgarishlarni saqlash</BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings { display: flex; flex-direction: column; gap: var(--sp-5); max-width: 820px; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--sp-6); box-shadow: var(--shadow-sm); }
.card__title { display: flex; align-items: center; gap: 8px; font-size: 16px; margin-bottom: var(--sp-5); color: var(--text); }
.card__title svg { color: var(--sky-500); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); }
.span-2 { grid-column: 1 / -1; }
.field { display: block; }
.field__label { display: block; font-size: 13.5px; font-weight: 600; color: var(--text-soft); margin-bottom: 7px; }
textarea { width: 100%; padding: 12px 14px; border: 1px solid var(--border-strong); border-radius: 12px; resize: vertical; color: var(--text); background: var(--surface); }
textarea:focus { outline: none; border-color: var(--sky-400); box-shadow: var(--focus-ring); }
.settings__foot { display: flex; justify-content: flex-end; }
@media (max-width: 620px) { .form-grid { grid-template-columns: 1fr; } }
</style>
