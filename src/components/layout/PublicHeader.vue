<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import BrandLogo from './BrandLogo.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import Icon from '@/components/ui/Icon.vue'

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()

const menuOpen = ref(false)
const userMenu = ref(false)

const nav = [
  { name: 'centers', label: 'Markazlar' },
  { name: 'directions', label: "Yo'nalishlar" },
  { name: 'about', label: 'Biz haqimizda' },
]

const panelLink = computed(() => {
  if (auth.isAdmin) return { name: 'admin-dashboard', label: 'Admin panel' }
  if (auth.isCenterSide) return { name: 'center-dashboard', label: 'Markaz paneli' }
  return null
})

function logout() {
  userMenu.value = false
  auth.logout()
  ui.success('Tizimdan chiqdingiz.')
}
</script>

<template>
  <header class="hd">
    <div class="container hd__inner">
      <RouterLink :to="{ name: 'home' }" class="hd__logo"><BrandLogo /></RouterLink>

      <nav class="hd__nav">
        <RouterLink
          v-for="n in nav"
          :key="n.name"
          :to="{ name: n.name }"
          class="hd__link"
          :class="{ active: route.name === n.name }"
        >
          {{ n.label }}
        </RouterLink>
      </nav>

      <div class="hd__actions">
        <RouterLink
          v-if="!auth.isCenterSide && !auth.isAdmin"
          :to="{ name: 'center-onboard' }"
          class="hd__partner"
        >
          Markaz ochish
        </RouterLink>

        <template v-if="auth.isAuthenticated">
          <RouterLink v-if="panelLink" :to="{ name: panelLink.name }" class="hd__panel-btn">
            <Icon name="chart" :size="16" /> {{ panelLink.label }}
          </RouterLink>

          <div class="usermenu">
            <button class="usermenu__trigger" @click="userMenu = !userMenu">
              <BaseAvatar :name="auth.fullName" :src="auth.user?.avatar" :size="34" />
            </button>
            <Transition name="drop">
              <div v-if="userMenu" class="usermenu__panel" @click="userMenu = false">
                <div class="usermenu__head">
                  <BaseAvatar :name="auth.fullName" :src="auth.user?.avatar" :size="40" />
                  <div>
                    <div class="usermenu__name">{{ auth.fullName }}</div>
                    <div class="usermenu__phone">{{ auth.user?.phone }}</div>
                  </div>
                </div>
                <hr class="hairline" />
                <RouterLink v-if="panelLink" :to="{ name: panelLink.name }" class="usermenu__item">
                  <Icon name="chart" :size="17" /> {{ panelLink.label }}
                </RouterLink>
                <button class="usermenu__item usermenu__item--danger" @click="logout">
                  <Icon name="log-out" :size="17" /> Chiqish
                </button>
              </div>
            </Transition>
          </div>
        </template>

        <BaseButton v-else size="sm" @click="ui.openAuth('login')">Kirish</BaseButton>

        <button class="hd__burger" aria-label="Menyu" @click="menuOpen = !menuOpen">
          <Icon :name="menuOpen ? 'x' : 'menu'" :size="22" />
        </button>
      </div>
    </div>

    <Transition name="drop">
      <div v-if="menuOpen" class="hd__mobile" @click="menuOpen = false">
        <RouterLink v-for="n in nav" :key="n.name" :to="{ name: n.name }" class="hd__mobile-link">
          {{ n.label }}
        </RouterLink>
        <RouterLink :to="{ name: 'center-onboard' }" class="hd__mobile-link">Markaz ochish</RouterLink>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.hd {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, .82);
  backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid var(--border);
}
.hd__inner {
  height: var(--header-h);
  display: flex;
  align-items: center;
  gap: var(--sp-6);
}
.hd__nav { display: flex; gap: 4px; margin-left: var(--sp-4); }
.hd__link {
  padding: 8px 14px;
  border-radius: var(--r-sm);
  font-size: 14.5px;
  font-weight: 600;
  color: var(--text-soft);
  transition: color .15s, background .15s;
}
.hd__link:hover { color: var(--sky-700); background: var(--sky-50); }
.hd__link.active { color: var(--sky-700); }

.hd__actions { display: flex; align-items: center; gap: var(--sp-3); margin-left: auto; }
.hd__partner {
  font-size: 14px; font-weight: 600; color: var(--text-soft);
  padding: 8px 12px; border-radius: var(--r-sm);
}
.hd__partner:hover { color: var(--sky-700); }
.hd__panel-btn {
  display: inline-flex; align-items: center; gap: 7px;
  height: 36px; padding: 0 14px;
  border-radius: var(--r-sm);
  background: var(--grad-brand-soft);
  color: var(--sky-700);
  font-size: 14px; font-weight: 600;
}
.hd__panel-btn:hover { box-shadow: var(--shadow-sm); }

.usermenu { position: relative; }
.usermenu__trigger { border-radius: 50%; transition: box-shadow .15s; }
.usermenu__trigger:hover { box-shadow: 0 0 0 3px var(--sky-100); }
.usermenu__panel {
  position: absolute;
  right: 0; top: calc(100% + 10px);
  width: 250px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--sp-3);
}
.usermenu__head { display: flex; align-items: center; gap: 10px; padding: 6px 8px 10px; }
.usermenu__name { font-weight: 700; font-size: 14.5px; }
.usermenu__phone { font-size: 12.5px; color: var(--text-muted); }
.usermenu__item {
  display: flex; align-items: center; gap: 10px;
  width: 100%;
  padding: 10px 8px;
  border-radius: var(--r-sm);
  font-size: 14px; font-weight: 500;
  color: var(--text-soft);
  text-align: left;
}
.usermenu__item:hover { background: var(--sky-50); color: var(--sky-700); }
.usermenu__item--danger:hover { background: var(--danger-50); color: var(--danger-500); }

.hd__burger { display: none; color: var(--text); padding: 6px; }
.hd__mobile { display: none; }

@media (max-width: 860px) {
  .hd__nav, .hd__partner, .hd__panel-btn { display: none; }
  .hd__burger { display: grid; place-items: center; }
  .hd__mobile {
    display: flex; flex-direction: column;
    padding: var(--sp-3) var(--sp-4) var(--sp-5);
    border-top: 1px solid var(--border);
    background: var(--surface);
  }
  .hd__mobile-link { padding: 13px 10px; font-weight: 600; border-radius: var(--r-sm); }
  .hd__mobile-link:hover { background: var(--sky-50); }
}

.drop-enter-active, .drop-leave-active { transition: opacity .18s, transform .18s; }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
