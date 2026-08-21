<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { adminApi } from '@/services/api'
import AppIcon from '@/components/ui/AppIcon.vue'
import { WEEKDAYS_FULL, formatTime12, isPastDay } from '@/utils/format'
import type { BlockedTime, BusinessHour } from '@/types'

const hours = ref<BusinessHour[]>([])
const blocked = ref<BlockedTime[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const saving = ref(false)
const savedMsg = ref('')

const form = reactive({
  date: '',
  allDay: false,
  startTime: '09:00',
  endTime: '17:00',
  reason: '',
})

const ordered = (list: BusinessHour[]) => [...list].sort((a, b) => a.dayOfWeek - b.dayOfWeek)

async function load() {
  loading.value = true
  error.value = null
  try {
    const [h, b] = await Promise.all([adminApi.getHours(), adminApi.getBlockedTimes()])
    hours.value = ordered(h)
    blocked.value = b
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No pudimos cargar los horarios.'
  } finally {
    loading.value = false
  }
}

async function saveHours() {
  saving.value = true
  savedMsg.value = ''
  try {
    hours.value = ordered(await adminApi.updateHours(hours.value))
    savedMsg.value = 'Horarios guardados.'
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudieron guardar.'
  } finally {
    saving.value = false
    setTimeout(() => (savedMsg.value = ''), 2500)
  }
}

function toggleDay(day: BusinessHour) {
  day.isOpen = !day.isOpen
}

async function addBlocked() {
  if (!form.date || isPastDay(form.date)) return
  try {
    const created = await adminApi.createBlockedTime({
      date: form.date,
      startTime: form.allDay ? undefined : form.startTime,
      endTime: form.allDay ? undefined : form.endTime,
      reason: form.reason || null,
      allDay: form.allDay,
    })
    blocked.value.push(created)
    blocked.value = [...blocked.value].sort((a, b) => a.date.localeCompare(b.date))
    form.date = ''
    form.reason = ''
    form.allDay = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo bloquear el horario.'
  }
}

async function removeBlocked(id: string) {
  await adminApi.deleteBlockedTime(id)
  blocked.value = blocked.value.filter((b) => b.id !== id)
}

function blockedLabel(b: BlockedTime): string {
  if (b.allDay) return 'Día completo'
  return `${formatTime12(b.startTime)} – ${formatTime12(b.endTime)}`
}

onMounted(load)
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <section class="border border-line bg-card p-5">
      <div class="mb-5 flex items-center justify-between">
        <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-white">Horario semanal</h2>
        <span v-if="savedMsg" class="text-xs text-brand-hover">{{ savedMsg }}</span>
      </div>

      <ul class="divide-y divide-line">
        <li v-for="day in hours" :key="day.dayOfWeek" class="flex flex-wrap items-center justify-between gap-3 py-3.5">
          <div class="flex items-center gap-3">
            <span class="text-sm font-bold uppercase tracking-wide text-white" :class="day.isOpen ? '' : 'text-muted-2'">
              {{ WEEKDAYS_FULL[day.dayOfWeek] }}
            </span>
            <button
              type="button"
              role="switch"
              :aria-checked="day.isOpen"
              :disabled="saving"
              class="relative h-6 w-11 rounded-full transition-colors"
              :class="day.isOpen ? 'bg-brand' : 'bg-card-2'"
              @click="toggleDay(day)"
            >
              <span
                class="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
                :class="day.isOpen ? 'translate-x-5' : 'translate-x-0.5'"
              />
            </button>
          </div>
          <div v-if="day.isOpen" class="flex items-center gap-2 text-sm">
            <input
              v-model="day.openTime"
              type="time"
              :aria-label="`Hora de apertura ${WEEKDAYS_FULL[day.dayOfWeek]}`"
              class="border border-line bg-ink px-2 py-1.5 text-sm text-white"
            />
            <span class="text-muted-2">–</span>
            <input
              v-model="day.closeTime"
              type="time"
              :aria-label="`Hora de cierre ${WEEKDAYS_FULL[day.dayOfWeek]}`"
              class="border border-line bg-ink px-2 py-1.5 text-sm text-white"
            />
          </div>
          <span v-else class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-2">Cerrado</span>
        </li>
      </ul>

      <button
        type="button"
        class="mt-5 inline-flex w-full items-center justify-center gap-2 bg-brand px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
        :disabled="saving"
        @click="saveHours"
      >
        <span v-if="saving" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
        Guardar horarios
      </button>
    </section>

    <section class="border border-line bg-card p-5">
      <h2 class="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white">Bloquear horarios</h2>

      <form class="grid gap-3" novalidate @submit.prevent="addBlocked">
        <div>
          <label for="bl-date" class="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Fecha</label>
          <input
            id="bl-date"
            v-model="form.date"
            type="date"
            class="w-full border border-line bg-ink px-3 py-2.5 text-sm text-white"
          />
        </div>

        <label class="flex items-center gap-3 text-sm text-white">
          <input v-model="form.allDay" type="checkbox" class="h-4 w-4 accent-[#e10600]" />
          Todo el día
        </label>

        <div v-if="!form.allDay" class="grid grid-cols-2 gap-3">
          <div>
            <label for="bl-start" class="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Desde</label>
            <input id="bl-start" v-model="form.startTime" type="time" class="w-full border border-line bg-ink px-3 py-2.5 text-sm text-white" />
          </div>
          <div>
            <label for="bl-end" class="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Hasta</label>
            <input id="bl-end" v-model="form.endTime" type="time" class="w-full border border-line bg-ink px-3 py-2.5 text-sm text-white" />
          </div>
        </div>

        <div>
          <label for="bl-reason" class="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Motivo (opcional)</label>
          <input id="bl-reason" v-model="form.reason" type="text" placeholder="Ej: mantenimiento" class="w-full border border-line bg-ink px-3 py-2.5 text-sm text-white placeholder:text-muted-2" />
        </div>

        <button
          type="submit"
          class="inline-flex items-center justify-center gap-2 border border-line-2 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:border-brand hover:text-brand-hover"
        >
          <AppIcon name="plus" :size="15" />
          Agregar bloqueo
        </button>
      </form>

      <ul class="mt-6 space-y-2">
        <li
          v-for="b in blocked"
          :key="b.id"
          class="flex items-center justify-between gap-3 border border-line bg-ink-2 px-3 py-3"
        >
          <div class="min-w-0">
            <p class="text-sm font-semibold text-white">{{ b.date }}</p>
            <p class="text-xs text-muted">{{ blockedLabel(b) }}<span v-if="b.reason"> · {{ b.reason }}</span></p>
          </div>
          <button
            type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center text-muted transition-colors hover:text-brand-hover"
            :aria-label="`Eliminar bloqueo del ${b.date}`"
            @click="removeBlocked(b.id)"
          >
            <AppIcon name="trash" :size="16" />
          </button>
        </li>
      </ul>
      <p v-if="blocked.length === 0" class="mt-6 text-center text-sm text-muted-2">No hay horarios bloqueados.</p>
    </section>

    <p v-if="error" class="border border-brand bg-brand-soft p-4 text-sm text-white lg:col-span-2">{{ error }}</p>
  </div>
</template>