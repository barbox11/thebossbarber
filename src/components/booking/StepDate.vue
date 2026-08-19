<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { publicApi } from '@/services/api'
import { useBookingStore } from '@/stores/booking'
import {
  buildMonthGrid,
  CALENDAR_WEEKDAYS,
  maxSelectableMonth,
  minSelectableMonth,
  shiftMonth,
} from '@/utils/calendar'
import { formatDateLong, isPastDay, monthLabel } from '@/utils/format'
import AppIcon from '@/components/ui/AppIcon.vue'

const store = useBookingStore()
const serviceId = computed(() => store.state.service?.id ?? '')

const month = ref(minSelectableMonth())
const days = computed(() => buildMonthGrid(month.value))
const monthData = ref<Record<string, { open: boolean; hasSlots: boolean; blocked: boolean }>>({})
const loadingMonth = ref(false)

const canPrev = computed(() => month.value > minSelectableMonth())
const canNext = computed(() => month.value < maxSelectableMonth())

async function loadMonth() {
  loadingMonth.value = true
  try {
    const res = await publicApi.getMonthAvailability(month.value, serviceId.value)
    monthData.value = res.days
  } catch {
    monthData.value = {}
  } finally {
    loadingMonth.value = false
  }
}

function dayState(key: string) {
  const info = monthData.value[key]
  if (isPastDay(key)) return 'past'
  if (!info) return 'unknown'
  if (info.blocked || !info.open) return 'closed'
  return info.hasSlots ? 'available' : 'full'
}

function selectDate(key: string) {
  if (isPastDay(key)) return
  const state = dayState(key)
  if (state !== 'available') return
  store.selectDate(key)
}

watch(month, loadMonth)
watch(serviceId, () => {
  if (serviceId.value) loadMonth()
})

onMounted(loadMonth)
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center border border-line-2 text-muted transition-colors hover:border-brand hover:text-white disabled:opacity-30"
        :disabled="!canPrev"
        :aria-label="'Mes anterior'"
        @click="month = shiftMonth(month, -1)"
      >
        <AppIcon name="arrowLeft" :size="16" />
      </button>
      <p class="font-display text-2xl uppercase tracking-wide text-white">{{ monthLabel(month) }}</p>
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center border border-line-2 text-muted transition-colors hover:border-brand hover:text-white disabled:opacity-30"
        :disabled="!canNext"
        :aria-label="'Mes siguiente'"
        @click="month = shiftMonth(month, 1)"
      >
        <AppIcon name="arrowRight" :size="16" />
      </button>
    </div>

    <div class="mt-5 grid grid-cols-7 gap-1 text-center">
      <span v-for="d in CALENDAR_WEEKDAYS" :key="d" class="py-2 text-[10px] font-bold uppercase tracking-widest text-muted-2">
        {{ d }}
      </span>
    </div>

    <div class="grid grid-cols-7 gap-1">
      <button
        v-for="day in days"
        :key="day.key"
        type="button"
        :disabled="dayState(day.key) !== 'available'"
        class="relative flex aspect-square items-center justify-center border text-sm transition-all duration-150 disabled:cursor-not-allowed"
        :class="{
          'border-transparent text-muted-2/40': !day.inMonth,
          'border-line text-muted-2 disabled:text-muted-2/30': day.inMonth && dayState(day.key) === 'past',
          'border-line text-muted-2/40 disabled:text-muted-2/30': dayState(day.key) === 'closed' || dayState(day.key) === 'full' || dayState(day.key) === 'unknown',
          'border-line bg-card text-white hover:border-brand hover:text-brand-hover active:scale-95': dayState(day.key) === 'available',
          'border-brand bg-brand text-white': store.state.date === day.key,
        }"
        :aria-label="`${formatDateLong(day.key)}`"
        @click="selectDate(day.key)"
      >
        <span
          v-if="day.inMonth && dayState(day.key) === 'available' && store.state.date !== day.key"
          class="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand"
          aria-hidden="true"
        />
        {{ day.day }}
      </button>
    </div>

    <p v-if="loadingMonth" class="mt-4 text-xs text-muted-2">Cargando disponibilidad…</p>
    <p v-else class="mt-4 text-xs leading-relaxed text-muted-2">
      Los días atenuados no tienen disponibilidad. Elige un día marcado para ver horarios.
    </p>
  </div>
</template>