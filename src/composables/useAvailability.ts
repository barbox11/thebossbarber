import { ref } from 'vue'
import { publicApi } from '@/services/api'
import type { AvailabilityResponse } from '@/types'

export function useAvailability() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const cached = ref<Record<string, AvailabilityResponse>>({})
  const current = ref<AvailabilityResponse | null>(null)

  async function load(date: string, serviceId?: string) {
    const cacheKey = `${date}:${serviceId ?? ''}`
    if (cached.value[cacheKey]) {
      current.value = cached.value[cacheKey]
      return current.value
    }
    loading.value = true
    error.value = null
    try {
      const data = await publicApi.getAvailability(date, serviceId)
      cached.value[cacheKey] = data
      current.value = data
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'No pudimos cargar la disponibilidad.'
      current.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, current, load }
}