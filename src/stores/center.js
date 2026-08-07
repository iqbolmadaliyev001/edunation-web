import { defineStore } from 'pinia'
import { centersApi } from '@/api'

/**
 * Markaz paneli konteksti — foydalanuvchining markaz(lar)i va faol markaz.
 * Ko'p markazli egалар uchun almashtirish imkoni.
 */
export const useCenterStore = defineStore('center', {
  state: () => ({
    myCenters: [],
    activeId: localStorage.getItem('edu_active_center') || null,
    loaded: false,
    loading: false,
  }),

  getters: {
    active: (s) => s.myCenters.find((c) => String(c.id) === String(s.activeId)) || s.myCenters[0] || null,
    hasCenter: (s) => s.myCenters.length > 0,
  },

  actions: {
    async load(force = false) {
      if (this.loaded && !force) return
      this.loading = true
      try {
        this.myCenters = await centersApi.mine()
        if (!this.activeId && this.myCenters.length) {
          this.setActive(this.myCenters[0].id)
        }
        this.loaded = true
      } finally {
        this.loading = false
      }
    },

    setActive(id) {
      this.activeId = String(id)
      localStorage.setItem('edu_active_center', this.activeId)
    },
  },
})
