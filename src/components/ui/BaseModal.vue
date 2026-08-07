<script setup>
import { watch, onBeforeUnmount } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md | lg
})
const emit = defineEmits(['close'])

watch(
  () => props.open,
  (v) => {
    document.body.style.overflow = v ? 'hidden' : ''
  }
)
onBeforeUnmount(() => (document.body.style.overflow = ''))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="overlay" @click.self="emit('close')">
        <div class="modal" :class="`modal--${size}`" role="dialog" aria-modal="true">
          <header v-if="title || $slots.header" class="modal__head">
            <slot name="header"><h3>{{ title }}</h3></slot>
            <button class="modal__close" aria-label="Yopish" @click="emit('close')">
              <Icon name="x" :size="20" />
            </button>
          </header>
          <div class="modal__body"><slot /></div>
          <footer v-if="$slots.footer" class="modal__foot"><slot name="footer" /></footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(10, 30, 49, .45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-4);
}
.modal {
  width: 100%;
  max-width: 460px;
  max-height: 92vh;
  overflow: auto;
  background: var(--surface);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border);
}
.modal--sm { max-width: 380px; }
.modal--lg { max-width: 720px; }
.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-5) var(--sp-6);
  border-bottom: 1px solid var(--border);
}
.modal__head h3 { font-size: 19px; }
.modal__close {
  width: 34px; height: 34px;
  display: grid; place-items: center;
  border-radius: var(--r-sm);
  color: var(--text-muted);
  transition: background .15s;
}
.modal__close:hover { background: var(--ink-50); color: var(--text); }
.modal__body { padding: var(--sp-6); }
.modal__foot {
  padding: var(--sp-4) var(--sp-6);
  border-top: 1px solid var(--border);
  display: flex;
  gap: var(--sp-3);
  justify-content: flex-end;
}

.modal-enter-active, .modal-leave-active { transition: opacity .2s ease; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform .24s cubic-bezier(.22,.61,.36,1); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: translateY(16px) scale(.98); }
</style>
