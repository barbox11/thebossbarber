import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { publicApi } from '@/services/api'
import type { BusinessSettings, Service } from '@/types'

export const useCatalogStore = defineStore('catalog', () => {
  const services = ref<Service[]>([])
  const settings = ref<BusinessSettings | null>(null)
  const loaded = ref(false)
  const loading = ref(false)

  const activeServices = computed(() =>
    [...services.value]
      .filter((s) => s.active)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  )

  const fallbackServices: Service[] = [
    { id: 'corte', name: 'Corte', description: 'Corte clásico o moderno con asesoría de estilo, lavado y acabado de precisión.', price: 20000, durationMin: 45, active: true, sortOrder: 1 },
    { id: 'corte-barba', name: 'Corte + Barba', description: 'Corte completo más perfilado de barba con toalla caliente y acabado premium.', price: 25000, durationMin: 60, active: true, sortOrder: 2 },
    { id: 'diseno-barba', name: 'Diseño de barba', description: 'Perfilado, arreglo y cuidado de barba con productos premium.', price: 10000, durationMin: 30, active: true, sortOrder: 3 },
    { id: 'corte-puntas', name: 'Corte de puntas', description: 'Retoque de puntas y acabado ligero.', price: 10000, durationMin: 15, active: true, sortOrder: 4 },
    { id: 'diseño-cejas', name: 'Diseño de cejas', description: 'Diseño y arreglo de cejas con técnica premium.', price: 5000, durationMin: 10, active: true, sortOrder: 5 },
  ]

  const fallbackSettings: BusinessSettings = {
    businessName: 'The Boss Barber',
    barberName: 'El Maestro Barbero',
    phone: '3217650814',
    whatsapp: '3217650814',
    address: 'Cra 23 # 18-87, La Hermosa',
    instagram: '',
    statsCustomers: '+2.000',
    statsYears: '5',
    statsRating: '4.9/5',
  }

  async function load() {
    if (loaded.value) return
    loading.value = true
    try {
      const [svc, stg] = await Promise.all([publicApi.getServices(), publicApi.getSettings()])
      services.value = svc.length ? svc : fallbackServices
      settings.value = stg
    } catch {
      services.value = fallbackServices
      settings.value = fallbackSettings
    } finally {
      loaded.value = true
      loading.value = false
    }
  }

  async function refreshServices() {
    services.value = await publicApi.getServices()
  }

  async function refresh() {
    loaded.value = false
    loading.value = true
    try {
      const [svc, stg] = await Promise.all([publicApi.getServices(), publicApi.getSettings()])
      services.value = svc.length ? svc : fallbackServices
      settings.value = stg
    } catch {
      services.value = fallbackServices
      settings.value = fallbackSettings
    } finally {
      loaded.value = true
      loading.value = false
    }
  }

  return { services, settings, activeServices, loaded, loading, load, refreshServices, refresh }
})