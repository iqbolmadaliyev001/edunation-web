<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { authApi } from '@/api'
import { useUiStore } from '@/stores/ui'
import { dateShort, phoneFormat } from '@/lib/format'
import PageHeader from '@/components/panel/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Icon from '@/components/ui/Icon.vue'

const ui = useUiStore()

const roleOptions = [
  { value: '', label: 'Barcha rollar' },
  { value: 'platform_admin', label: 'Platforma admini' },
  { value: 'center_owner', label: 'Markaz egasi' },
  { value: 'center_staff', label: 'Markaz xodimi' },
  { value: 'teacher', label: "O'qituvchi" },
  { value: 'student', label: "O'quvchi" },
  { value: 'parent', label: 'Ota-ona' },
]

const statusOptions = [
  { value: '', label: 'Barchasi' },
  { value: 'true', label: 'Faol' },
  { value: 'false', label: 'Bloklangan' },
]

const roleTone = {
  platform_admin: 'brand',
  center_owner: 'gold',
  center_staff: 'neutral',
  teacher: 'success',
  student: 'neutral',
  parent: 'neutral',
}

const search = ref('')
const role = ref('')
const active = ref('')
const items = ref([])
const count = ref(0)
const page = ref(1)
const loading = ref(true)
const busyId = ref(null)

const pageCount = computed(() => Math.max(1, Math.ceil(count.value / 20)))

async function load() {
  loading.value = true
  try {
    const params = { page: page.value, page_size: 20 }
    if (search.value.trim()) params.search = search.value.trim()
    if (role.value) params.role = role.value
    if (active.value) params.is_active = active.value

    const data = await authApi.users(params)
    items.value = data.results
    count.value = data.count
  } catch (e) {
    ui.error(e.message)
  } finally {
    loading.value = false
  }
}

watch([role, active], () => {
  page.value = 1
  load()
})
watch(page, load)

let timer
watch(search, () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    page.value = 1
    load()
  }, 350)
})

async function toggle(user) {
  busyId.value = user.id
  try {
    const res = await authApi.toggleUser(user.id)
    user.is_active = res.is_active
    ui.success(user.is_active ? 'Akkaunt faollashtirildi.' : 'Akkaunt bloklandi.')
  } catch (e) {
    ui.error(e.message)
  } finally {
    busyId.value = null
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader title="Foydalanuvchilar" :subtitle="`Jami ${count} ta akkaunt`" />

    <div class="filters">
      <div class="filters__search">
        <BaseInput v-model="search" placeholder="Ism yoki telefon" icon="search" />
      </div>
      <div class="filters__sel">
        <BaseSelect v-model="role" :options="roleOptions" placeholder="Rol" />
      </div>
      <div class="filters__sel">
        <BaseSelect v-model="active" :options="statusOptions" placeholder="Holat" />
      </div>
    </div>

    <BaseSpinner v-if="loading" center />

    <EmptyState
      v-else-if="!items.length"
      icon="users"
      title="Foydalanuvchi topilmadi"
      text="Boshqa filtr bilan urinib ko'ring."
    />

    <template v-else>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Foydalanuvchi</th>
              <th>Telefon</th>
              <th>Rol</th>
              <th>Markaz</th>
              <th>Ro'yxatdan o'tgan</th>
              <th>Holat</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in items" :key="u.id">
              <td>
                <div class="user">
                  <BaseAvatar :name="u.full_name" :src="u.avatar" :size="34" />
                  <div>
                    <div class="user__name">{{ u.full_name }}</div>
                    <div v-if="u.email" class="user__mail">{{ u.email }}</div>
                  </div>
                </div>
              </td>
              <td class="tabular nowrap">{{ phoneFormat(u.phone) }}</td>
              <td>
                <BaseBadge :tone="roleTone[u.role] || 'neutral'" size="sm">
                  {{ u.role_display }}
                </BaseBadge>
              </td>
              <td class="muted">{{ u.center_name || '—' }}</td>
              <td class="muted nowrap">{{ dateShort(u.created_at) }}</td>
              <td>
                <span class="status" :class="u.is_active ? 'status--on' : 'status--off'">
                  <i></i>{{ u.is_active ? 'Faol' : 'Bloklangan' }}
                </span>
              </td>
              <td class="right">
                <BaseButton
                  size="sm"
                  :variant="u.is_active ? 'ghost' : 'secondary'"
                  :loading="busyId === u.id"
                  @click="toggle(u)"
                >
                  {{ u.is_active ? 'Bloklash' : 'Faollashtirish' }}
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
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
  </div>
</template>

<style scoped>
.filters { display: flex; gap: var(--sp-3); flex-wrap: wrap; margin-bottom: var(--sp-5); }
.filters__search { flex: 1; min-width: 220px; max-width: 340px; }
.filters__sel { width: 190px; }

.table-wrap {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow-x: auto;
  box-shadow: var(--shadow-sm);
}
.table { width: 100%; border-collapse: collapse; min-width: 900px; }
.table th {
  text-align: left; font-size: 12px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .04em;
  color: var(--text-muted);
  padding: 14px var(--sp-4);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.table td {
  padding: 12px var(--sp-4);
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}
.table tbody tr:last-child td { border-bottom: none; }
.table tbody tr:hover { background: var(--ink-50); }

.user { display: flex; align-items: center; gap: 10px; }
.user__name { font-weight: 600; }
.user__mail { font-size: 12px; color: var(--text-muted); }
.muted { color: var(--text-muted); }
.nowrap { white-space: nowrap; }
.right { text-align: right; }

.status { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; }
.status i { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
.status--on { color: var(--success-500); }
.status--on i { background: var(--success-500); }
.status--off { color: var(--danger-500); }
.status--off i { background: var(--danger-500); }

.pager {
  display: flex; align-items: center; justify-content: center; gap: var(--sp-4);
  margin-top: var(--sp-6);
}
.pager__info { font-size: 14px; font-weight: 600; color: var(--text-soft); }
</style>
