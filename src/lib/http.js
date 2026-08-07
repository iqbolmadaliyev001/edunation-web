import axios from 'axios'

/**
 * Yagona axios instansi.
 *
 * - Access token har so'rovga qo'shiladi.
 * - 401 kelganda refresh token bilan avtomatik yangilanadi va so'rov qayta yuboriladi.
 * - Bir vaqtda kelgan bir nechta 401 uchun bitta refresh so'rovi ishlaydi (navbat).
 */

const ACCESS_KEY = 'edu_access'
const REFRESH_KEY = 'edu_refresh'

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY)
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY)
  },
  set({ access, refresh }) {
    if (access) localStorage.setItem(ACCESS_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

const http = axios.create({
  baseURL: '/api/v1',
  headers: { 'X-Client': 'web' },
  timeout: 20000,
})

http.interceptors.request.use((config) => {
  const token = tokenStore.access
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing = null

async function runRefresh() {
  const refresh = tokenStore.refresh
  if (!refresh) throw new Error('no-refresh')
  const { data } = await axios.post('/api/v1/auth/refresh/', { refresh })
  tokenStore.set({ access: data.access, refresh: data.refresh })
  return data.access
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error
    if (!response || response.status !== 401 || config._retried) {
      return Promise.reject(normalizeError(error))
    }
    // refresh endpointining o'zi 401 bo'lsa — sessiya tugagan
    if (config.url?.includes('/auth/refresh')) {
      handleSessionExpired()
      return Promise.reject(normalizeError(error))
    }

    config._retried = true
    try {
      refreshing = refreshing || runRefresh().finally(() => (refreshing = null))
      const access = await refreshing
      config.headers.Authorization = `Bearer ${access}`
      return http(config)
    } catch (e) {
      handleSessionExpired()
      return Promise.reject(normalizeError(error))
    }
  }
)

function handleSessionExpired() {
  tokenStore.clear()
  // auth store buni tinglaydi
  window.dispatchEvent(new CustomEvent('edu:session-expired'))
}

/** Backend {error:{code,message,details}} formatini bir xil obyektga keltiradi. */
export function normalizeError(error) {
  const data = error?.response?.data
  if (data?.error) {
    return {
      code: data.error.code || 'error',
      message: data.error.message || 'Xatolik yuz berdi.',
      details: data.error.details || {},
      status: error.response.status,
    }
  }
  // DRF standart validatsiya xatolari
  if (data && typeof data === 'object') {
    const firstKey = Object.keys(data)[0]
    const firstVal = data[firstKey]
    return {
      code: 'validation',
      message: Array.isArray(firstVal) ? firstVal[0] : String(firstVal || 'Xatolik'),
      details: data,
      status: error?.response?.status,
    }
  }
  return {
    code: 'network',
    message: error?.message || 'Tarmoq xatosi. Internetni tekshiring.',
    details: {},
    status: error?.response?.status,
  }
}

export default http
