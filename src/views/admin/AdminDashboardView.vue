<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { adminApi } from '@/services/api'
import AppIcon from '@/components/ui/AppIcon.vue'
import BarChart from '@/components/admin/BarChart.vue'
import HorizontalBars from '@/components/admin/HorizontalBars.vue'
import ProgressRing from '@/components/admin/ProgressRing.vue'
import { formatCOP, formatTime12 } from '@/utils/format'
import type { DashboardSummary } from '@/types'

const data = ref<DashboardSummary | null>(null)
const error = ref<string | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    data.value = await adminApi.dashboard()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No pudimos cargar el panel.'
  } finally {
    loading.value = false
  }
})

const kpis = (d: DashboardSummary) => [
  { label: 'Reservas del día', value: String(d.todayBookings), icon: 'calendar' },
  { label: 'Reservas del mes', value: String(d.monthBookings), icon: 'calendarCheck' },
  { label: 'Ingresos del mes', value: formatCOP(d.monthRevenue), icon: 'trendUp' },
  { label: 'Clientes', value: String(d.customers), icon: 'users' },
  { label: 'Citas completadas', value: String(d.completed), icon: 'check' },
  { label: 'Citas canceladas', value: String(d.cancelled), icon: 'calendarX' },
]
</script>

<template>
  <div>
    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 6" :key="i" class="h-28 animate-pulse rounded bg-card" />
    </div>

    <div v-else-if="error" class="border border-brand bg-brand-soft p-6 text-sm text-white">
      {{ error }}
    </div>

    <template v-else-if="data">
      <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <div v-for="k in kpis(data)" :key="k.label" class="border border-line bg-card p-4">
          <AppIcon :name="k.icon" :size="18" class="text-brand" />
          <p class="mt-3 font-display text-2xl leading-none text-white sm:text-3xl">{{ k.value }}</p>
          <p class="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{{ k.label }}</p>
        </div>
      </div>

      <div class="mt-6 grid gap-4 lg:grid-cols-3">
        <div class="border border-line bg-card p-5 lg:col-span-2">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-white">Reservas · últimos 7 días</h2>
            <span class="text-[10px] uppercase tracking-[0.14em] text-muted-2">por día</span>
          </div>
          <BarChart :data="data.bookingsByDay" />
        </div>

        <div class="border border-line bg-card p-5">
          <h2 class="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white">Ocupación del mes</h2>
          <div class="flex flex-col items-center gap-4 py-2">
            <ProgressRing :percent="data.occupancyRate" />
            <p class="text-center text-xs text-muted-2">Espacios ocupados sobre la capacidad del mes.</p>
          </div>
        </div>

        <div class="border border-line bg-card p-5 lg:col-span-2">
          <h2 class="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white">Servicios más reservados</h2>
          <HorizontalBars :data="data.servicesByBookings" />
        </div>

        <div class="border border-line bg-card p-5">
          <h2 class="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white">Horarios más solicitados</h2>
          <HorizontalBars :data="data.busyHours" />
        </div>

        <div class="border border-line bg-card p-5 lg:col-span-3">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-white">Reservas de hoy</h2>
            <RouterLink :to="{ name: 'admin-bookings' }" class="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-hover hover:text-white">
              Ver todas
            </RouterLink>
          </div>
          <ul v-if="data.todayAppointments.length" class="divide-y divide-line">
            <li v-for="a in data.todayAppointments" :key="a.id" class="flex items-center justify-between gap-3 py-3">
              <div class="flex items-center gap-3">
                <span class="h-2.5 w-2.5 rounded-full bg-brand" aria-hidden="true" />
                <div>
                  <p class="text-sm font-semibold text-white">{{ a.name }}</p>
                  <p class="text-xs text-muted">{{ a.service }}</p>
                </div>
              </div>
              <span class="font-display text-lg text-white">{{ formatTime12(a.time) }}</span>
            </li>
          </ul>
          <p v-else class="py-6 text-center text-sm text-muted-2">No hay reservas para hoy.</p>
        </div>
      </div>
    </template>
  </div>
</template>