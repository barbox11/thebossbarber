<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import { publicApi } from '@/services/api'
import AppIcon from '@/components/ui/AppIcon.vue'
import { formatTime12, WEEKDAYS_SHORT } from '@/utils/format'
import type { BusinessHour } from '@/types'

const BusinessMap = defineAsyncComponent(() => import('@/components/home/BusinessMap.vue'))

const catalog = useCatalogStore()
const hours = ref<BusinessHour[]>([])
const mapShell = ref<HTMLElement | null>(null)
const mapVisible = ref(false)
let mapObserver: IntersectionObserver | null = null

const hoursLabel = computed(() => {
  const openHours = hours.value
    .filter((day) => day.isOpen)
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .map((day) => `${WEEKDAYS_SHORT[day.dayOfWeek]} ${formatTime12(day.openTime)}–${formatTime12(day.closeTime)}`)

  return openHours.length ? openHours.join(' · ') : 'Horario no disponible'
})

function mapsUrl(): string {
  const addr = catalog.settings?.address
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr ?? '')}`
}

onMounted(async () => {
  if (!catalog.loaded) await catalog.load()
  try {
    hours.value = await publicApi.getHours()
  } catch {
    hours.value = []
  }

  if ('IntersectionObserver' in window && mapShell.value) {
    mapObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          mapVisible.value = true
          mapObserver?.disconnect()
        }
      },
      { rootMargin: '240px' },
    )
    mapObserver.observe(mapShell.value)
  } else {
    mapVisible.value = true
  }
})

onUnmounted(() => mapObserver?.disconnect())
</script>

<template>
  <section id="ubicacion" class="bg-ink py-20 md:py-28">
    <div class="container-x grid gap-12 lg:grid-cols-12">
      <div class="reveal lg:col-span-5">
        <p class="eyebrow">Ubicación</p>
        <h2 class="mt-4 text-display text-5xl text-pure sm:text-6xl">
          Visítanos<span class="text-brand-hover">.</span>
        </h2>
        <p class="mt-6 max-w-sm text-[15px] leading-relaxed text-muted">
          Te esperamos en un espacio pensado para tu comodidad y privacidad. Reserva tu turno y llega puntual.
        </p>

        <ul class="mt-8 space-y-5 text-sm">
          <li class="flex items-start gap-4">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center border border-line-2 text-brand">
              <AppIcon name="pin" :size="18" />
            </span>
            <div>
              <p class="font-bold uppercase tracking-[0.14em] text-white">Dirección</p>
              <p class="mt-1 text-muted">{{ catalog.settings?.address ?? 'Tu barbería premium' }}</p>
            </div>
          </li>
          <li class="flex items-start gap-4">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center border border-line-2 text-brand">
              <AppIcon name="clock" :size="18" />
            </span>
            <div>
              <p class="font-bold uppercase tracking-[0.14em] text-white">Horario de atención</p>
              <p class="mt-1 text-muted">{{ hoursLabel }}</p>
            </div>
          </li>
          <li class="flex items-start gap-4">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center border border-line-2 text-brand">
              <AppIcon name="phone" :size="18" />
            </span>
            <div>
              <p class="font-bold uppercase tracking-[0.14em] text-white">Teléfono</p>
              <p class="mt-1 text-muted">{{ catalog.settings?.phone ?? '+57 300 000 0000' }}</p>
            </div>
          </li>
        </ul>

        <a
          :href="mapsUrl()"
          target="_blank"
          rel="noopener noreferrer"
          class="group mt-9 inline-flex items-center gap-3 border border-line-2 px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-brand hover:text-brand-hover"
        >
          Cómo llegar
          <AppIcon name="arrowRight" :size="16" class="transition-transform group-hover:translate-x-1" />
        </a>
      </div>

      <div class="reveal lg:col-span-7">
        <div ref="mapShell" class="crop-frame relative h-full min-h-105 overflow-hidden border border-line bg-ink-2 lg:min-h-130">
          <BusinessMap v-if="mapVisible" />
          <div v-else class="absolute inset-0 bg-card" aria-label="Mapa cargando" />
        </div>
      </div>
    </div>
  </section>
</template>