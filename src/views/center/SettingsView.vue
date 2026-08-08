<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { centersApi, catalogApi } from '@/api'
import { useCenterStore } from '@/stores/center'
import { useUiStore } from '@/stores/ui'
import PageHeader from '@/components/panel/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import Icon from '@/components/ui/Icon.vue'
import MapPicker from '@/components/ui/MapPicker.vue'

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

// --- Filial (manzil va xaritadagi joylashuv) -------------------------------
// Geolokatsiya markazda emas, filialda saqlanadi: markaz tarmoq bo'lishi
// mumkin, xarita esa har bir filialni alohida ko'rsatadi.
const branch = ref(null)            // mavjud filial yozuvi yoki null
const regions = ref([])
const savingBranch = ref(false)

const branchForm = reactive({
  region: '', address: '', landmark: '', phone: '',
})
const coords = ref(null)            // { lat, lng } yoki null

// Faqat tuman/shahar tanlanadi — viloyat yoki davlat darajasi manzil bo'lolmaydi.
// Bir xil nomli tumanlar bo'lgani uchun yonida viloyati ham ko'rsatiladi.
const districtOptions = computed(() => {
  const byId = new Map(regions.value.map((r) => [r.id, r]))
  return [
    { value: '', label: 'Tanlang...' },
    ...regions.value
      .filter((r) => r.level === 'district')
      .map((r) => {
        const parent = byId.get(r.parent)
        return { value: r.id, label: parent ? `${r.name} — ${parent.name}` : r.name }
      }),
  ]
})

const canSaveBranch = computed(
  () => !!branchForm.region && branchForm.address.trim().length > 2,
)

async function load() {
  if (!centerStore.active) return
  loading.value = true
  try {
    detail.value = await centersApi.detail(centerStore.active.slug)
    Object.keys(form).forEach((k) => { form[k] = detail.value[k] ?? '' })

    const list = detail.value.branches ?? []
    branch.value = list.find((b) => b.is_main) ?? list[0] ?? null
    if (branch.value) {
      branchForm.region = branch.value.region ?? ''
      branchForm.address = branch.value.address ?? ''
      branchForm.landmark = branch.value.landmark ?? ''
      branchForm.phone = branch.value.phone ?? ''
      coords.value = branch.value.latitude != null
        ? { lat: Number(branch.value.latitude), lng: Number(branch.value.longitude) }
        : null
    }
  } finally {
    loading.value = false
  }
}

async function loadRegions() {
  try {
    const data = await catalogApi.regions()
    regions.value = Array.isArray(data) ? data : (data.results ?? [])
  } catch {
    regions.value = []
  }
}

// Koordinata hali qo'yilmagan bo'lsa, tanlangan tuman markaziga o'tamiz —
// foydalanuvchi butun mamlakat ko'lamidan qidirib o'tirmasin.
watch(() => branchForm.region, (id) => {
  if (!id || coords.value) return
  const r = regions.value.find((x) => String(x.id) === String(id))
  if (r?.latitude != null) {
    coords.value = { lat: Number(r.latitude), lng: Number(r.longitude) }
  }
})

async function saveBranch() {
  if (!canSaveBranch.value) {
    ui.error('Tuman va manzilni to\'ldiring.')
    return
  }
  savingBranch.value = true
  try {
    const payload = {
      region: branchForm.region,
      address: branchForm.address.trim(),
      landmark: branchForm.landmark.trim(),
      phone: branchForm.phone.trim(),
      latitude: coords.value?.lat ?? null,
      longitude: coords.value?.lng ?? null,
    }
    branch.value = branch.value
      ? await centersApi.updateBranch(branch.value.id, payload)
      : await centersApi.createBranch({ ...payload, center: detail.value.id, is_main: true })
    ui.success('Joylashuv saqlandi.')
  } catch (e) {
    ui.error(e.message)
  } finally {
    savingBranch.value = false
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
  loadRegions()
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

      <section class="card">
        <h3 class="card__title"><Icon name="map-pin" :size="18" /> Manzil va xaritadagi joylashuv</h3>
        <p class="card__hint">
          Xaritadagi nuqta o'quvchilarga ilovada va saytda ko'rinadi — «yaqin
          atrofdagi markazlar» qidiruvi ham shunga tayanadi. Iloji boricha
          aniq belgilang.
        </p>

        <div class="form-grid">
          <BaseSelect v-model="branchForm.region" label="Tuman / shahar" :options="districtOptions" />
          <BaseInput v-model="branchForm.phone" label="Filial telefoni" icon="phone" inputmode="tel" />
          <div class="span-2">
            <BaseInput v-model="branchForm.address" label="Manzil" icon="map-pin"
                       placeholder="Ko'cha, uy raqami" />
          </div>
          <div class="span-2">
            <BaseInput v-model="branchForm.landmark" label="Mo'ljal"
                       placeholder="Masalan: Markaziy bozor ro'parasida" />
          </div>
        </div>

        <div class="mapblock">
          <MapPicker v-model="coords" height="360px" />
          <div class="mapblock__foot">
            <span v-if="coords" class="coords">
              <Icon name="check-circle" :size="15" />
              {{ coords.lat.toFixed(6) }}, {{ coords.lng.toFixed(6) }}
            </span>
            <span v-else class="coords coords--empty">
              <Icon name="x-circle" :size="15" />
              Joylashuv belgilanmagan — markaz xaritada ko'rinmaydi
            </span>
            <BaseButton icon="check" :loading="savingBranch" :disabled="!canSaveBranch"
                        @click="saveBranch">
              Joylashuvni saqlash
            </BaseButton>
          </div>
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

.card__hint { font-size: 13.5px; color: var(--text-muted); margin: calc(var(--sp-5) * -1 + 4px) 0 var(--sp-5); line-height: 1.5; }
.mapblock { margin-top: var(--sp-5); }
.mapblock__foot { display: flex; align-items: center; justify-content: space-between; gap: var(--sp-4); margin-top: var(--sp-4); flex-wrap: wrap; }
.coords { display: inline-flex; align-items: center; gap: 7px; font-size: 13.5px; font-weight: 600; color: var(--success-500); font-variant-numeric: tabular-nums; }
.coords--empty { color: var(--text-muted); font-weight: 500; }

@media (max-width: 620px) { .form-grid { grid-template-columns: 1fr; } }
</style>
