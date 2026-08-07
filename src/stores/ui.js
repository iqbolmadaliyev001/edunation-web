import { defineStore } from 'pinia'

let toastId = 0

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [],
    theme: localStorage.getItem('edu_theme') || 'light',
    authModal: { open: false, mode: 'login', purpose: 'login' },
  }),

  actions: {
    toast(message, kind = 'info', timeout = 4000) {
      const id = ++toastId
      this.toasts.push({ id, message, kind })
      if (timeout) setTimeout(() => this.dismiss(id), timeout)
      return id
    },
    success(msg) {
      return this.toast(msg, 'success')
    },
    error(msg) {
      return this.toast(msg, 'danger', 5500)
    },
    dismiss(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },

    openAuth(mode = 'login') {
      this.authModal = { open: true, mode, purpose: 'login' }
    },
    closeAuth() {
      this.authModal.open = false
    },

    applyTheme(theme) {
      this.theme = theme
      localStorage.setItem('edu_theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    },
    toggleTheme() {
      this.applyTheme(this.theme === 'dark' ? 'light' : 'dark')
    },
  },
})
