<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { adminApi } from '@/services/api'
import AppIcon from '@/components/ui/AppIcon.vue'
import { formatCOP, formatTime12, WEEKDAYS_FULL } from '@/utils/format'
import type { Appointment, AppointmentStatus } from '@/types'

const appointments = ref<Appointment[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const filter = ref<'ALL' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'>('ALL')

const statusLabels: Record<AppointmentStatus, string> = {
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No asistió',
}

const visible = computed(() => {
  const list = appointments.value
  if (filter.value === 'ALL') return list
  return list.filter((a) => a.status === filter.value)
})

async function load() {
  loading.value = true
  error.value = null
  try {
    appointments.value = await adminApi.listAppointments()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No pudimos cargar las reservas.'
  } finally {
    loading.value = false
  }
}

async function changeStatus(a: Appointment, status: AppointmentStatus) {
  const updated = await adminApi.updateAppointmentStatus(a.id, status)
  const idx = appointments.value.findIndex((x) => x.id === a.id)
  if (idx !== -1) appointments.value[idx] = { ...appointments.value[idx], status: updated.status }
}

function dateLabel(iso: string): string {
  const d = new Date(iso)
  return `${WEEKDAYS_FULL[d.getDay()]} ${d.getDate()}`
}

onMounted(load)
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-sm font-bold uppercase tracking-[0.2em] text-white">Reservas</h2>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="f in ['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const"
          :key="f"
          type="button"
          class="border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors"
          :class="filter === f ? 'border-brand bg-brand text-white' : 'border-line-2 text-muted hover:text-white'"
          @click="filter = f"
        >
          {{ f === 'ALL' ? 'Todas' : statusLabels[f] }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="space-y-2">
      <div v-for="i in 5" :key="i" class="h-20 animate-pulse bg-card" />
    </div>

    <div v-else-if="error" class="border border-brand bg-brand-soft p-5 text-sm text-white">{{ error }}</div>

    <div v-else-if="visible.length === 0" class="border border-line bg-card p-10 text-center text-sm text-muted-2">
      No hay reservas con este estado.
    </div>

    <div v-else class="overflow-x-auto border border-line">
      <table class="w-full min-w-[720px] text-left text-sm">
        <thead class="border-b border-line bg-ink-2">
          <tr class="text-[10px] uppercase tracking-[0.16em] text-muted">
            <th class="px-4 py-3 font-bold">Cliente</th>
            <th class="px-4 py-3 font-bold">Servicio</th>
            <th class="px-4 py-3 font-bold">Fecha</th>
            <th class="px-4 py-3 font-bold">Hora</th>
            <th class="px-4 py-3 font-bold">Valor</th>
            <th class="px-4 py-3 font-bold">Estado</th>
            <th class="px-4 py-3 font-bold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr v-for="a in visible" :key="a.id" class="bg-card transition-colors hover:bg-card-2">
            <td class="px-4 py-3">
              <p class="font-semibold text-white">{{ a.nameSnapshot }}</p>
              <p class="text-xs text-muted">{{ a.phoneSnapshot }}</p>
            </td>
            <td class="px-4 py-3 text-muted">{{ a.service?.name ?? '—' }}</td>
            <td class="px-4 py-3 text-muted">{{ dateLabel(a.slotStart) }}</td>
            <td class="px-4 py-3 font-display text-base text-white">{{ formatTime12(a.time) }}</td>
            <td class="px-4 py-3 text-muted">{{ formatCOP(a.priceAtBooking) }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
                :class="
                  a.status === 'CONFIRMED'
                    ? 'bg-brand/15 text-brand-hover'
                    : a.status === 'COMPLETED'
                      ? 'bg-white/10 text-white'
                      : 'bg-white/5 text-muted-2'
                "
              >
                {{ statusLabels[a.status] }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-1.5">
                <button
                  v-if="a.status === 'CONFIRMED'"
                  type="button"
                  class="flex h-8 w-8 items-center justify-center border border-line-2 text-muted transition-colors hover:border-brand hover:text-brand-hover"
                  :aria-label="`Marcar como completada la reserva de ${a.nameSnapshot}`"
                  title="Completar"
                  @click="changeStatus(a, 'COMPLETED')"
                >
                  <AppIcon name="check" :size="14" />
                </button>
                <button
                  v-if="a.status !== 'CANCELLED' && a.status !== 'COMPLETED'"
                  type="button"
                  class="flex h-8 w-8 items-center justify-center border border-line-2 text-muted transition-colors hover:border-brand hover:text-brand-hover"
                  :aria-label="`Cancelar la reserva de ${a.nameSnapshot}`"
                  title="Cancelar"
                  @click="changeStatus(a, 'CANCELLED')"
                >
                  <AppIcon name="close" :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>