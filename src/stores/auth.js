import { defineStore } from 'pinia'
import { authApi } from '@/api'
import { tokenStore } from '@/lib/http'

/** Rollar — backend Role.choices bilan mos. */
export const ROLES = {
  ADMIN: 'platform_admin',
  OWNER: 'center_owner',
  STAFF: 'center_staff',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    ready: false, // dastlabki me() tekshiruvi tugadimi
    loading: false,
  }),

  getters: {
    isAuthenticated: (s) => !!s.user,
    role: (s) => s.user?.role || null,
    isAdmin: (s) => s.user?.role === ROLES.ADMIN || s.user?.is_superuser,
    isCenterSide: (s) => [ROLES.OWNER, ROLES.STAFF, ROLES.TEACHER].includes(s.user?.role),
    fullName: (s) =>
      s.user ? `${s.user.first_name} ${s.user.last_name || ''}`.trim() : '',
    /** Kirgandan keyin qayerga yo'naltirish. */
    homeRoute() {
      if (this.isAdmin) return { name: 'admin-dashboard' }
      if (this.isCenterSide) return { name: 'center-dashboard' }
      return { name: 'home' }
    },
  },

  actions: {
    async bootstrap() {
      // sessiya tugaganini global tinglash
      window.addEventListener('edu:session-expired', () => this.clearSession())
      if (tokenStore.access) {
        try {
          this.user = await authApi.me()
        } catch {
          this.clearSession()
        }
      }
      this.ready = true
    },

    async requestOtp(phone, purpose = 'login') {
      return authApi.requestOtp({ phone, purpose })
    },

    async verifyOtp(payload) {
      this.loading = true
      try {
        const res = await authApi.verifyOtp(payload)
        tokenStore.set({ access: res.access, refresh: res.refresh })
        this.user = res.user
        return res
      } finally {
        this.loading = false
      }
    },

    async loginWithPassword(phone, password) {
      this.loading = true
      try {
        const res = await authApi.login({ phone, password })
        tokenStore.set({ access: res.access, refresh: res.refresh })
        this.user = res.user || (await authApi.me())
        return res
      } finally {
        this.loading = false
      }
    },

    async refreshMe() {
      if (!tokenStore.access) return
      this.user = await authApi.me()
    },

    async logout() {
      try {
        if (tokenStore.refresh) await authApi.logout(tokenStore.refresh)
      } catch {
        /* baribir tokenlarni tozalaymiz */
      }
      this.clearSession()
    },

    clearSession() {
      tokenStore.clear()
      this.user = null
    },
  },
})
