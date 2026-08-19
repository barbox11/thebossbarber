<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useAvailability } from '@/composables/useAvailability'
import { useBookingStore } from '@/stores/booking'
import { formatDateFull, formatTime12 } from '@/utils/format'
import AppIcon from '@/components/ui/AppIcon.vue'

const store = useBookingStore()
const { loading, error, current, load } = useAvailability()

const date = computed(() => store.state.date ?? '')
const serviceId = computed(() => store.state.service?.id ?? '')

const slots = computed(() => current.value?.slots ?? [])
const hasAvailable = computed(() => slots.value.some((s) => s.available && !s.blocked))

onMounted(() => {
  if (date.value) load(date.value, serviceId.value)
})
watch(date, (d) => {
  if (d) load(d, serviceId.value)
})
watch(serviceId, () => {
  if (date.value) load(date.value, serviceId.value)
})

function isDisabled(slot: { available: boolean; blocked: boolean }): boolean {
  return slot.blocked || !slot.available
}
</script>

<template>
  <div>
    <p class="eyebrow">{{ date ? formatDateFull(date) : '' }}</p>

    <div v-if="loading" class="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      <div v-for="i in 12" :key="i" class="h-12 animate-pulse bg-card" />
    </div>

    <div v-else-if="error" class="mt-6 border border-line bg-card p-6 text-center">
      <AppIcon name="close" :size="20" class="mx-auto text-brand" />
      <p class="mt-3 text-sm text-muted">{{ error }}</p>
    </div>

    <div v-else-if="!hasAvailable" class="mt-6 border border-line bg-card p-8 text-center">
      <p class="font-display text-2xl uppercase text-white">Sin horarios disponibles</p>
      <p class="mt-2 text-sm text-muted">Este día ya no tiene turnos. Elige otra fecha.</p>
    </div>

    <div v-else class="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      <button
        v-for="slot in slots"
        :key="slot.time"
        type="button"
        :disabled="isDisabled(slot)"
        class="h-12 border text-xs font-bold uppercase tracking-wider transition-all duration-150"
        :class="
          store.state.time === slot.time
            ? 'border-brand bg-brand text-white'
            : isDisabled(slot)
              ? 'cursor-not-allowed border-line bg-card text-muted-2/35 line-through decoration-muted-2/40'
              : 'border-line bg-card text-white hover:border-brand hover:text-brand-hover active:scale-95'
        "
        :aria-label="`${formatTime12(slot.time)}${slot.available && !slot.blocked ? ' disponible' : ' no disponible'}`"
        @click="store.selectTime(slot.time)"
      >
        {{ formatTime12(slot.time) }}
      </button>
    </div>

    <p v-if="hasAvailable" class="mt-4 flex items-center gap-2 text-xs text-muted-2">
      <span class="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
      Los horarios tachados ya fueron reservados.
    </p>
  </div>
</template>