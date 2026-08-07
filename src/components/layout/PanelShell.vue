<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import BrandLogo from './BrandLogo.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import Icon from '@/components/ui/Icon.vue'

defineProps({
  nav: { type: Array, required: true }, // [{name,label,icon}]
  accent: { type: String, default: 'Markaz paneli' },
})

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

const collapsed = ref(false)
const mobileOpen = ref(false)

function logout() {
  auth.logout()
  ui.success('Tizimdan chiqdingiz.')
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="shell" :class="{ 'shell--collapsed': collapsed }">
    <!-- Sidebar -->
    <aside class="side" :class="{ 'side--mobile-open': mobileOpen }">
      <div class="side__top">
        <RouterLink :to="{ name: 'home' }" class="side__logo">
          <BrandLogo :size="32" />
        </RouterLink>
        <button class="side__collapse" @click="collapsed = !collapsed">
          <Icon :name="collapsed ? 'chevron-right' : 'chevron-left'" :size="18" />
        </button>
      </div>

      <span class="side__label">{{ accent }}</span>

      <nav class="side__nav" @click="mobileOpen = false">
        <RouterLink
          v-for="n in nav"
          :key="n.name"
          :to="{ name: n.name }"
          class="navitem"
          active-class="navitem--active"
          :exact="n.exact"
        >
          <span class="navitem__icon"><Icon :name="n.icon" :size="19" /></span>
          <span class="navitem__label">{{ n.label }}</span>
          <span v-if="n.badge" class="navitem__badge">{{ n.badge }}</span>
        </RouterLink>
      </nav>

      <div class="side__foot">
        <slot name="sidebar-foot" />
        <button class="navitem navitem--logout" @click="logout">
          <span class="navitem__icon"><Icon name="log-out" :size="19" /></span>
          <span class="navitem__label">Chiqish</span>
        </button>
      </div>
    </aside>

    <div v-if="mobileOpen" class="scrim" @click="mobileOpen = false" />

    <!-- Asosiy qism -->
    <div class="body">
      <header class="topbar">
        <button class="topbar__burger" @click="mobileOpen = true"><Icon name="menu" :size="22" /></button>
        <div class="topbar__slot"><slot name="topbar" /></div>
        <div class="topbar__actions">
          <button class="topbar__icon-btn" @click="ui.toggleTheme()">
            <Icon :name="ui.theme === 'dark' ? 'sun' : 'moon'" :size="19" />
          </button>
          <button class="topbar__icon-btn"><Icon name="bell" :size="19" /></button>
          <div class="topbar__user">
            <BaseAvatar :name="auth.fullName" :src="auth.user?.avatar" :size="36" />
            <div class="topbar__user-info">
              <div class="topbar__user-name">{{ auth.fullName }}</div>
              <div class="topbar__user-role">{{ auth.user?.phone }}</div>
            </div>
          </div>
        </div>
      </header>

      <main class="content">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell { display: grid; grid-template-columns: 256px 1fr; min-height: 100vh; background: var(--bg); }
.shell--collapsed { grid-template-columns: 76px 1fr; }

/* Sidebar */
.side {
  display: flex; flex-direction: column;
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: var(--sp-4);
  position: sticky; top: 0; height: 100vh;
}
.side__top { display: flex; align-items: center; justify-content: space-between; padding: 6px 6px var(--sp-4); }
.shell--collapsed .side__logo :deep(.logo__text) { display: none; }
.side__collapse { width: 30px; height: 30px; display: grid; place-items: center; border-radius: var(--r-sm); color: var(--text-muted); }
.side__collapse:hover { background: var(--sky-50); color: var(--sky-600); }
.shell--collapsed .side__collapse { display: none; }

.side__label {
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--text-muted); padding: var(--sp-3) 10px 8px;
}
.shell--collapsed .side__label { opacity: 0; }

.side__nav { display: flex; flex-direction: column; gap: 3px; flex: 1; }
.navitem {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 12px;
  border-radius: var(--r-md);
  color: var(--text-soft);
  font-weight: 600; font-size: 14.5px;
  transition: background .15s, color .15s;
  position: relative;
}
.navitem:hover { background: var(--sky-50); color: var(--sky-700); }
.navitem--active { background: var(--grad-brand-soft); color: var(--sky-700); }
.navitem--active .navitem__icon { color: var(--sky-600); }
.navitem__icon { flex-shrink: 0; display: grid; place-items: center; }
.shell--collapsed .navitem__label { display: none; }
.navitem__badge {
  margin-left: auto;
  font-size: 11px; font-weight: 700;
  background: var(--danger-500); color: #fff;
  min-width: 20px; height: 20px;
  display: grid; place-items: center;
  border-radius: var(--r-full); padding: 0 6px;
}
.shell--collapsed .navitem__badge { position: absolute; top: 4px; right: 4px; min-width: 16px; height: 16px; font-size: 9px; }

.side__foot { display: flex; flex-direction: column; gap: 3px; padding-top: var(--sp-3); border-top: 1px solid var(--border); }
.navitem--logout { width: 100%; text-align: left; }
.navitem--logout:hover { background: var(--danger-50); color: var(--danger-500); }

/* Body */
.body { display: flex; flex-direction: column; min-width: 0; }
.topbar {
  position: sticky; top: 0; z-index: 20;
  height: 64px;
  display: flex; align-items: center; gap: var(--sp-4);
  padding: 0 var(--sp-6);
  background: rgba(255,255,255,.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
:root[data-theme='dark'] .topbar { background: rgba(10,30,49,.85); }
.topbar__burger { display: none; color: var(--text); }
.topbar__slot { flex: 1; min-width: 0; }
.topbar__actions { display: flex; align-items: center; gap: var(--sp-3); }
.topbar__icon-btn {
  width: 40px; height: 40px; display: grid; place-items: center;
  border-radius: var(--r-sm); color: var(--text-soft);
}
.topbar__icon-btn:hover { background: var(--sky-50); color: var(--sky-600); }
.topbar__user { display: flex; align-items: center; gap: 10px; padding-left: var(--sp-3); border-left: 1px solid var(--border); }
.topbar__user-name { font-size: 14px; font-weight: 700; line-height: 1.1; }
.topbar__user-role { font-size: 12px; color: var(--text-muted); }

.content { padding: var(--sp-6); flex: 1; min-width: 0; }

.scrim { display: none; }

@media (max-width: 900px) {
  .shell, .shell--collapsed { grid-template-columns: 1fr; }
  .side {
    position: fixed; z-index: 60; left: 0; top: 0; width: 260px;
    transform: translateX(-100%); transition: transform .25s ease;
    box-shadow: var(--shadow-xl);
  }
  .side--mobile-open { transform: translateX(0); }
  .side__collapse { display: none; }
  .topbar__burger { display: grid; place-items: center; }
  .scrim { display: block; position: fixed; inset: 0; z-index: 55; background: rgba(10,30,49,.4); }
  .topbar__user-info { display: none; }
}

.fade-enter-active, .fade-leave-active { transition: opacity .16s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
