import { ref, shallowRef } from 'vue'
import { normalizeError } from '@/lib/http'

/**
 * Async chaqiruvni loading/error/data holatlari bilan o'raydi.
 * Har bir sahifa buni ishlatib, qo'lda try/catch yozmasligi uchun.
 *
 *   const { data, loading, error, run } = useAsync(centersApi.list)
 *   run({ page: 1 })
 */
export function useAsync(fn, { immediate = false, initial = null } = {}) {
  const data = shallowRef(initial)
  const loading = ref(false)
  const error = ref(null)

  async function run(...args) {
    loading.value = true
    error.value = null
    try {
      data.value = await fn(...args)
      return data.value
    } catch (e) {
      error.value = e.code ? e : normalizeError(e)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  if (immediate) run()

  return { data, loading, error, run }
}
