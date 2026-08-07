<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import Icon from '@/components/ui/Icon.vue'

const ui = useUiStore()
const auth = useAuthStore()
const router = useRouter()

const step = ref('phone') // phone | code
const loading = ref(false)
const cooldown = ref(0)
const debugCode = ref('')
let timer = null

const form = reactive({
  phone: '+998',
  code: '',
  first_name: '',
  last_name: '',
  role: 'student',
})
const errors = reactive({ phone: '', code: '', first_name: '' })

const isNewFlow = ref(false) // kod bosqichida ism so'raladimi (biz bilmaymiz — ixtiyoriy ko'rsatamiz)

const roles = [
  { value: 'student', label: 'O\'quvchi', icon: 'graduation-cap' },
  { value: 'parent', label: 'Ota-ona', icon: 'users' },
  { value: 'center_owner', label: 'Markaz egasi', icon: 'building' },
]

const phoneValid = computed(() => /^\+998\d{9}$/.test(form.phone))

watch(
  () => ui.authModal.open,
  (open) => {
    if (open) reset()
  }
)

function reset() {
  step.value = 'phone'
  form.code = ''
  form.first_name = ''
  form.last_name = ''
  errors.phone = errors.code = errors.first_name = ''
  debugCode.value = ''
}

function startCooldown(sec) {
  cooldown.value = sec
  clearInterval(timer)
  timer = setInterval(() => {
    cooldown.value -= 1
    if (cooldown.value <= 0) clearInterval(timer)
  }, 1000)
}

async function requestCode() {
  errors.phone = ''
  if (!phoneValid.value) {
    errors.phone = 'Telefon +998XXXXXXXXX ko\'rinishida bo\'lishi kerak.'
    return
  }
  loading.value = true
  try {
    const res = await auth.requestOtp(form.phone, 'login')
    step.value = 'code'
    startCooldown(60)
    if (res.debug_code) {
      debugCode.value = res.debug_code
      form.code = res.debug_code // dev qulayligi
    }
    ui.toast('Tasdiqlash kodi yuborildi.', 'info')
  } catch (e) {
    errors.phone = e.message
  } finally {
    loading.value = false
  }
}

async function verify() {
  errors.code = ''
  errors.first_name = ''
  if (form.code.length < 4) {
    errors.code = 'Kodni to\'liq kiriting.'
    return
  }
  loading.value = true
  try {
    const payload = {
      phone: form.phone,
      code: form.code,
      role: form.role,
    }
    if (form.first_name) payload.first_name = form.first_name
    if (form.last_name) payload.last_name = form.last_name

    const res = await auth.verifyOtp(payload)
    ui.closeAuth()
    ui.success(res.is_new ? 'Xush kelibsiz! Akkaunt yaratildi.' : 'Tizimga kirdingiz.')
    router.push(auth.homeRoute)
  } catch (e) {
    if (e.details?.first_name) {
      errors.first_name = Array.isArray(e.details.first_name)
        ? e.details.first_name[0]
        : e.details.first_name
      isNewFlow.value = true
    } else {
      errors.code = e.message
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal :open="ui.authModal.open" size="sm" @close="ui.closeAuth()">
    <template #header>
      <div class="ah">
        <span class="ah__mark"><Icon name="logo" :size="20" /></span>
        <div>
          <h3>{{ step === 'phone' ? 'Kirish yoki ro\'yxatdan o\'tish' : 'Tasdiqlash kodi' }}</h3>
          <p class="ah__sub">
            {{ step === 'phone'
              ? 'Telefon raqamingizni kiriting'
              : `${form.phone} raqamiga yuborildi` }}
          </p>
        </div>
      </div>
    </template>

    <!-- 1-bosqich: telefon -->
    <div v-if="step === 'phone'" class="stack">
      <BaseInput
        v-model="form.phone"
        label="Telefon raqam"
        icon="phone"
        inputmode="tel"
        placeholder="+998 90 123 45 67"
        :error="errors.phone"
        @enter="requestCode"
      />

      <div class="roles">
        <p class="roles__label">Men platformada:</p>
        <div class="roles__grid">
          <button
            v-for="r in roles"
            :key="r.value"
            class="role"
            :class="{ active: form.role === r.value }"
            @click="form.role = r.value"
          >
            <Icon :name="r.icon" :size="18" />
            {{ r.label }}
          </button>
        </div>
      </div>

      <BaseButton block size="lg" :loading="loading" @click="requestCode">
        Kod olish
      </BaseButton>
      <p class="fineprint">
        Davom etish orqali <a href="#">foydalanish shartlari</a>ga rozilik bildirasiz.
      </p>
    </div>

    <!-- 2-bosqich: kod -->
    <div v-else class="stack">
      <div v-if="debugCode" class="devhint">
        <Icon name="code" :size="15" /> Dev kod: <b>{{ debugCode }}</b>
      </div>

      <BaseInput
        v-model="form.code"
        label="6 xonali kod"
        icon="shield"
        inputmode="numeric"
        placeholder="— — — — — —"
        :error="errors.code"
        @enter="verify"
      />

      <div class="name-row">
        <BaseInput
          v-model="form.first_name"
          label="Ism"
          placeholder="Ismingiz"
          :error="errors.first_name"
          :hint="!errors.first_name ? 'Yangi bo\'lsangiz to\'ldiring' : ''"
        />
        <BaseInput v-model="form.last_name" label="Familiya" placeholder="Ixtiyoriy" />
      </div>

      <BaseButton block size="lg" :loading="loading" @click="verify">
        Tasdiqlash va kirish
      </BaseButton>

      <div class="resend">
        <button class="link" @click="step = 'phone'">
          <Icon name="chevron-left" :size="15" /> Raqamni o'zgartirish
        </button>
        <button class="link" :disabled="cooldown > 0" @click="requestCode">
          {{ cooldown > 0 ? `Qayta yuborish (${cooldown}s)` : 'Kodni qayta yuborish' }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.ah { display: flex; align-items: center; gap: var(--sp-3); }
.ah__mark {
  width: 40px; height: 40px;
  display: grid; place-items: center;
  border-radius: var(--r-md);
  background: var(--grad-brand);
  color: #fff;
  box-shadow: var(--shadow-brand);
}
.ah h3 { font-size: 17px; line-height: 1.2; }
.ah__sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; }

.stack { display: flex; flex-direction: column; gap: var(--sp-5); }
.name-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-3); }

.roles__label { font-size: 13.5px; font-weight: 600; color: var(--text-soft); margin-bottom: 8px; }
.roles__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.role {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 6px;
  border: 1px solid var(--border-strong);
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--text-soft);
  font-size: 12.5px;
  font-weight: 600;
  transition: all .15s;
}
.role:hover { border-color: var(--sky-300); color: var(--sky-700); }
.role.active {
  border-color: var(--sky-400);
  background: var(--grad-brand-soft);
  color: var(--sky-700);
  box-shadow: var(--shadow-xs);
}

.fineprint { font-size: 12px; color: var(--text-muted); text-align: center; }
.fineprint a { color: var(--sky-600); font-weight: 500; }

.devhint {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px;
  padding: 9px 12px;
  border-radius: var(--r-sm);
  background: var(--sky-50);
  color: var(--sky-700);
  border: 1px dashed var(--sky-200);
}
.resend { display: flex; justify-content: space-between; }
.link {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 13px; font-weight: 600; color: var(--sky-600);
}
.link:disabled { color: var(--text-muted); }
</style>
