<script setup>
import { onMounted, ref } from 'vue'
import { catalogApi } from '@/api'
import { useUiStore } from '@/stores/ui'
import PageHeader from '@/components/panel/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import Icon from '@/components/ui/Icon.vue'

/**
 * Katalog — hududlar va yo'nalishlar daraxti.
 *
 * `is_launched` bayrog'i strategik: platforma qaysi shaharda rasman
 * ishga tushganini belgilaydi (Qo'qon → viloyatlar → butun mamlakat).
 */
const ui = useUiStore()

const tab = ref('regions')
const regions = ref([])
const directions = ref([])
const loading = ref(true)

const modal = ref(null) // { kind: 'region'|'direction', item }
const form = ref({})
const saving = ref(false)

const levelOptions = [
  { value: 'country', label: 'Davlat' },
  { value: 'region', label: 'Viloyat' },
  { value: 'district', label: 'Tuman / Shahar' },
]

const iconOptions = [
  { value: 'language', label: 'Til' },
  { value: 'calculator', label: 'Aniq fanlar' },
  { value: 'code', label: 'IT' },
  { value: 'target', label: 'Imtihon' },
  { value: 'palette', label: 'Ijod' },
  { value: 'book-open', label: 'Umumiy' },
]

async function load() {
  loading.value = true
  try {
    const [r, d] = await Promise.all([catalogApi.regionTree(), catalogApi.directionTree()])
    regions.value = r
    directions.value = d
  } catch (e) {
    ui.error(e.message)
  } finally {
    loading.value = false
  }
}

function openCreate(kind, parentId = null) {
  modal.value = { kind, item: null }
  form.value =
    kind === 'region'
      ? { name_uz: '', name_ru: '', level: parentId ? 'district' : 'region', parent: parentId, is_launched: false }
      : { name_uz: '', name_ru: '', parent: parentId, icon: 'book-open', color: '#2490E6', is_popular: false }
}

function openEdit(kind, item) {
  modal.value = { kind, item }
  form.value = { ...item }
}

async function save() {
  saving.value = true
  try {
    const { kind, item } = modal.value
    if (kind === 'region') {
      item
        ? await catalogApi.updateRegion(item.id, form.value)
        : await catalogApi.createRegion(form.value)
    } else {
      item
        ? await catalogApi.updateDirection(item.id, form.value)
        : await catalogApi.createDirection(form.value)
    }
    ui.success('Saqlandi.')
    modal.value = null
    load()
  } catch (e) {
    ui.error(e.message)
  } finally {
    saving.value = false
  }
}

async function toggleLaunched(region) {
  try {
    await catalogApi.updateRegion(region.id, { is_launched: !region.is_launched })
    region.is_launched = !region.is_launched
    ui.success(region.is_launched ? 'Hudud ishga tushirildi.' : 'Hudud kutish rejimida.')
  } catch (e) {
    ui.error(e.message)
  }
}

async function togglePopular(direction) {
  try {
    await catalogApi.updateDirection(direction.id, { is_popular: !direction.is_popular })
    direction.is_popular = !direction.is_popular
  } catch (e) {
    ui.error(e.message)
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      title="Katalog"
      subtitle="Hududlar va ta'lim yo'nalishlari — qidiruv filtrlari shu ma'lumotdan quriladi"
    >
      <template #actions>
        <BaseButton icon="plus" @click="openCreate(tab === 'regions' ? 'region' : 'direction')">
          {{ tab === 'regions' ? "Hudud qo'shish" : "Yo'nalish qo'shish" }}
        </BaseButton>
      </template>
    </PageHeader>

    <div class="tabs">
      <button class="tab" :class="{ 'tab--active': tab === 'regions' }" @click="tab = 'regions'">
        <Icon name="map-pin" :size="16" /> Hududlar
      </button>
      <button class="tab" :class="{ 'tab--active': tab === 'directions' }" @click="tab = 'directions'">
        <Icon name="book-open" :size="16" /> Yo'nalishlar
      </button>
    </div>

    <BaseSpinner v-if="loading" center />

    <!-- Hududlar daraxti -->
    <div v-else-if="tab === 'regions'" class="tree">
      <div v-for="root in regions" :key="root.id" class="node">
        <div class="node__row node__row--root">
          <Icon name="globe" :size="18" class="node__icon" />
          <span class="node__name">{{ root.name_uz }}</span>
          <BaseBadge v-if="root.is_launched" tone="success" size="sm">Ishga tushgan</BaseBadge>
          <div class="node__actions">
            <button class="mini" @click="openCreate('region', root.id)">
              <Icon name="plus" :size="15" />
            </button>
            <button class="mini" @click="openEdit('region', root)">
              <Icon name="edit" :size="15" />
            </button>
          </div>
        </div>

        <div v-for="child in root.children" :key="child.id" class="node node--child">
          <div class="node__row">
            <Icon name="map-pin" :size="16" class="node__icon" />
            <span class="node__name">{{ child.name_uz }}</span>
            <span class="node__count tabular">{{ child.centers_count }} markaz</span>
            <button
              class="pill"
              :class="{ 'pill--on': child.is_launched }"
              @click="toggleLaunched(child)"
            >
              {{ child.is_launched ? 'Faol' : 'Kutmoqda' }}
            </button>
            <div class="node__actions">
              <button class="mini" @click="openCreate('region', child.id)">
                <Icon name="plus" :size="15" />
              </button>
              <button class="mini" @click="openEdit('region', child)">
                <Icon name="edit" :size="15" />
              </button>
            </div>
          </div>

          <div v-for="leaf in child.children" :key="leaf.id" class="node__row node__row--leaf">
            <span class="node__dash"></span>
            <span class="node__name">{{ leaf.name_uz }}</span>
            <span class="node__count tabular">{{ leaf.centers_count }} markaz</span>
            <button
              class="pill"
              :class="{ 'pill--on': leaf.is_launched }"
              @click="toggleLaunched(leaf)"
            >
              {{ leaf.is_launched ? 'Faol' : 'Kutmoqda' }}
            </button>
            <div class="node__actions">
              <button class="mini" @click="openEdit('region', leaf)">
                <Icon name="edit" :size="15" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Yo'nalishlar -->
    <div v-else class="dirs">
      <section v-for="group in directions" :key="group.id" class="dirgroup">
        <header class="dirgroup__head">
          <span class="dirgroup__icon" :style="{ background: group.color }">
            <Icon :name="group.icon || 'book-open'" :size="18" />
          </span>
          <h3>{{ group.name_uz }}</h3>
          <span class="dirgroup__count">{{ group.children?.length || 0 }} ta</span>
          <div class="node__actions">
            <button class="mini" @click="openCreate('direction', group.id)">
              <Icon name="plus" :size="15" />
            </button>
            <button class="mini" @click="openEdit('direction', group)">
              <Icon name="edit" :size="15" />
            </button>
          </div>
        </header>

        <div class="chips">
          <div v-for="d in group.children" :key="d.id" class="chip">
            <span class="chip__name">{{ d.name_uz }}</span>
            <span class="chip__count tabular">{{ d.centers_count }}</span>
            <button
              class="chip__star"
              :class="{ 'chip__star--on': d.is_popular }"
              title="Mashhur yo'nalish"
              @click="togglePopular(d)"
            >
              <Icon name="star" :size="14" />
            </button>
            <button class="chip__edit" @click="openEdit('direction', d)">
              <Icon name="edit" :size="14" />
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- Yaratish / tahrirlash -->
    <BaseModal
      :open="!!modal"
      :title="modal?.item ? 'Tahrirlash' : (modal?.kind === 'region' ? 'Yangi hudud' : 'Yangi yo\'nalish')"
      @close="modal = null"
    >
      <div v-if="modal" class="form">
        <BaseInput v-model="form.name_uz" label="Nomi (o'zbekcha)" placeholder="Masalan: Qo'qon" />
        <BaseInput v-model="form.name_ru" label="Nomi (ruscha)" placeholder="Коканд" />

        <template v-if="modal.kind === 'region'">
          <BaseSelect v-model="form.level" label="Daraja" :options="levelOptions" />
          <label class="check">
            <input v-model="form.is_launched" type="checkbox" />
            <span>Platforma bu hududda rasman ishga tushgan</span>
          </label>
        </template>

        <template v-else>
          <BaseSelect v-model="form.icon" label="Ikonka" :options="iconOptions" />
          <label class="colorfield">
            <span>Aksent rang</span>
            <input v-model="form.color" type="color" />
          </label>
          <label class="check">
            <input v-model="form.is_popular" type="checkbox" />
            <span>Bosh sahifada mashhur yo'nalish sifatida ko'rsatilsin</span>
          </label>
        </template>
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="modal = null">Bekor qilish</BaseButton>
        <BaseButton :loading="saving" @click="save">Saqlash</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.tabs {
  display: flex; gap: 4px; margin-bottom: var(--sp-5); padding: 4px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-md); width: fit-content;
}
.tab {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 15px; border-radius: var(--r-sm);
  font-size: 14px; font-weight: 600; color: var(--text-soft);
}
.tab:hover { background: var(--sky-50); color: var(--sky-700); }
.tab--active { background: var(--grad-brand-soft); color: var(--sky-700); }

/* Hududlar daraxti */
.tree {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: var(--sp-4);
  box-shadow: var(--shadow-sm);
}
.node--child { margin-left: var(--sp-5); }
.node__row {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: var(--r-sm);
}
.node__row:hover { background: var(--ink-50); }
.node__row--root { font-weight: 700; font-size: 15px; }
.node__row--leaf { margin-left: var(--sp-5); font-size: 13.5px; }
.node__icon { color: var(--sky-600); flex-shrink: 0; }
.node__dash { width: 12px; height: 1px; background: var(--ink-200); flex-shrink: 0; }
.node__name { flex: 1; min-width: 0; }
.node__count { font-size: 12.5px; color: var(--text-muted); }

.node__actions { display: flex; gap: 4px; opacity: 0; transition: opacity .15s; }
.node__row:hover .node__actions,
.dirgroup__head:hover .node__actions { opacity: 1; }
.mini {
  width: 28px; height: 28px; display: grid; place-items: center;
  border-radius: var(--r-xs); color: var(--text-muted);
}
.mini:hover { background: var(--sky-100); color: var(--sky-700); }

.pill {
  font-size: 11.5px; font-weight: 700; padding: 4px 10px;
  border-radius: var(--r-full);
  background: var(--ink-100); color: var(--text-muted);
}
.pill--on { background: var(--success-50); color: var(--success-500); }

/* Yo'nalishlar */
.dirs { display: flex; flex-direction: column; gap: var(--sp-4); }
.dirgroup {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: var(--sp-5);
  box-shadow: var(--shadow-sm);
}
.dirgroup__head { display: flex; align-items: center; gap: 12px; margin-bottom: var(--sp-4); }
.dirgroup__icon {
  width: 36px; height: 36px; border-radius: var(--r-sm);
  display: grid; place-items: center; color: #fff; flex-shrink: 0;
}
.dirgroup__head h3 { font-size: 16px; flex: 1; }
.dirgroup__count { font-size: 12.5px; color: var(--text-muted); }

.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 7px 8px 7px 14px;
  border: 1px solid var(--border); border-radius: var(--r-full);
  font-size: 13.5px; font-weight: 600;
}
.chip:hover { border-color: var(--sky-200); background: var(--sky-50); }
.chip__count {
  font-size: 11.5px; color: var(--text-muted);
  background: var(--ink-100); padding: 1px 7px; border-radius: var(--r-full);
}
.chip__star, .chip__edit {
  width: 24px; height: 24px; display: grid; place-items: center;
  border-radius: 50%; color: var(--ink-300);
}
.chip__star:hover, .chip__edit:hover { background: var(--sky-100); color: var(--sky-600); }
.chip__star--on { color: var(--gold-500); }

/* Forma */
.form { display: flex; flex-direction: column; gap: var(--sp-4); }
.check { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--text-soft); cursor: pointer; }
.check input { width: 17px; height: 17px; accent-color: var(--sky-500); }
.colorfield { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 13.5px; font-weight: 600; color: var(--text-soft); }
.colorfield input {
  width: 56px; height: 34px; border: 1px solid var(--border-strong);
  border-radius: var(--r-sm); background: none; cursor: pointer; padding: 2px;
}
</style>
