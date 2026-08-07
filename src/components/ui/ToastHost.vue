<script setup>
import { useUiStore } from '@/stores/ui'
import Icon from './Icon.vue'

const ui = useUiStore()
const iconFor = { success: 'check-circle', danger: 'x-circle', warning: 'bell', info: 'sparkles' }
</script>

<template>
  <Teleport to="body">
    <div class="toasts">
      <TransitionGroup name="toast">
        <div v-for="t in ui.toasts" :key="t.id" class="toast" :class="`toast--${t.kind}`">
          <Icon :name="iconFor[t.kind] || 'sparkles'" :size="18" />
          <span>{{ t.message }}</span>
          <button class="toast__x" @click="ui.dismiss(t.id)"><Icon name="x" :size="15" /></button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toasts {
  position: fixed;
  bottom: var(--sp-6);
  right: var(--sp-6);
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  max-width: min(92vw, 400px);
}
.toast {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: 13px 15px;
  border-radius: var(--r-md);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  font-size: 14.5px;
  font-weight: 500;
  color: var(--text);
}
.toast--success { border-left: 3px solid var(--success-500); }
.toast--success > svg { color: var(--success-500); }
.toast--danger { border-left: 3px solid var(--danger-500); }
.toast--danger > svg { color: var(--danger-500); }
.toast--warning { border-left: 3px solid var(--warning-500); }
.toast--warning > svg { color: var(--warning-500); }
.toast--info > svg { color: var(--sky-500); }
.toast span { flex: 1; }
.toast__x { color: var(--text-muted); display: grid; place-items: center; }
.toast__x:hover { color: var(--text); }

@media (max-width: 620px) {
  .toasts { left: var(--sp-4); right: var(--sp-4); bottom: var(--sp-4); max-width: none; }
}

.toast-enter-active, .toast-leave-active { transition: all .3s cubic-bezier(.22,.61,.36,1); }
.toast-enter-from { opacity: 0; transform: translateX(30px); }
.toast-leave-to { opacity: 0; transform: translateX(30px); }
</style>
