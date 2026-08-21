<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import AppIcon from '@/components/ui/AppIcon.vue'
import { formatCOP, minutesToLabel } from '@/utils/format'
import type { Service } from '@/types'

const router = useRouter()
const catalog = useCatalogStore()

const services = computed(() => catalog.activeServices)
const loading = computed(() => catalog.loading && !catalog.loaded)

onMounted(() => {
  if (!catalog.loaded) catalog.load()
})

function bookService(service: Service) {
  router.push({ path: '/reservar', query: { servicio: service.id } })
}
</script>

<template>
  <section id="servicios" class="bg-ink py-16 md:py-24">
    <div class="container-x">
      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="eyebrow">Menú de especialidades</p>
          <h2 class="mt-4 text-display text-5xl text-pure sm:text-6xl">
            Servicios<span class="text-brand-hover">.</span>
          </h2>
          <p class="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
            Cada servicio incluye asesoría de estilo, lavado y acabado. Selecciona el tuyo y reserva tu espacio.
          </p>
        </div>
        <RouterLink
          to="/reservar"
          class="reveal inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-hover transition-colors hover:text-white"
        >
          Ver todos
          <AppIcon name="arrowRight" :size="15" />
        </RouterLink>
      </div>

      <div class="mt-12 divide-y divide-line">
        <div v-if="loading" class="divide-y divide-line">
          <div v-for="i in 3" :key="i" class="flex items-center justify-between py-8">
            <div class="h-6 w-40 animate-pulse rounded bg-card" />
            <div class="h-6 w-20 animate-pulse rounded bg-card" />
          </div>
        </div>

        <template v-else>
          <article
            v-for="service in services"
            :key="service.id"
            class="group grid gap-3 border-b border-line py-8 transition-colors hover:bg-card/40 md:grid-cols-2 md:items-center md:gap-6 md:px-4 md:hover:px-6"
          >
            <div class="md:col-span-1">
              <span class="h-1 w-8 bg-line transition-colors group-hover:bg-brand" aria-hidden="true" />
            </div>
            <h3 class="font-display text-3xl uppercase tracking-wide text-pure transition-colors group-hover:text-brand-hover md:col-span-2 sm:text-4xl">
              {{ service.name }}
            </h3>
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted md:col-span-2">
              <AppIcon name="clock" :size="14" class="text-brand" />
              {{ minutesToLabel(service.durationMin) }}
            </div>
            <p class="text-sm leading-relaxed text-muted md:col-span-2">{{ service.description }}</p>
            <p class="font-display text-3xl text-white md:col-span-2 md:text-right">
              {{ formatCOP(service.price) }}
            </p>
            <div class="md:col-span-1 md:text-right">
              <button
                type="button"
                class="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted transition-colors group-hover:text-brand-hover"
                :aria-label="`Reservar ${service.name}`"
                @click="bookService(service)"
              >
                Reservar
                <AppIcon name="arrowRight" :size="14" class="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </article>
        </template>
      </div>

      <p class="mt-8 text-xs leading-relaxed text-muted-2">
        * Para servicios personalizados adicionales, consúltalo directamente el día de tu cita.
      </p>
    </div>
  </section>
</template>

<style scoped>
</style>