<script setup lang="ts">
import { computed } from 'vue'
import { useBookingStore } from '@/stores/booking'
import AppIcon from '@/components/ui/AppIcon.vue'
import { formatCOP, formatDateFull, formatTime12, minutesToLabel } from '@/utils/format'

const store = useBookingStore()
const emit = defineEmits<{ (e: 'back'): void; (e: 'confirm'): void }>()

const service = computed(() => store.state.service)
const date = computed(() => store.state.date ?? '')
const time = computed(() => store.state.time ?? '')

const whatsapp = computed(() => store.state.phone)
</script>

<template>
  <div v-if="service">
    <div class="border border-line bg-card">
      <div class="flex items-center justify-between border-b border-line p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">Servicio</p>
        <p class="font-display text-xl uppercase text-white">{{ service.name }}</p>
      </div>
      <div class="grid grid-cols-2 divide-x divide-line border-b border-line">
        <div class="p-5">
          <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">Fecha</p>
          <p class="mt-1.5 text-sm font-semibold text-white">{{ formatDateFull(date) }}</p>
        </div>
        <div class="p-5">
          <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">Hora</p>
          <p class="mt-1.5 text-sm font-semibold text-white">{{ formatTime12(time) }}</p>
        </div>
      </div>
      <div class="flex items-center justify-between p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">Duración</p>
        <p class="flex items-center gap-1.5 text-sm font-semibold text-muted">
          <AppIcon name="clock" :size="14" class="text-brand" />
          {{ minutesToLabel(service.durationMin) }}
        </p>
      </div>
      <div class="flex items-center justify-between border-t border-brand bg-brand-soft px-5 py-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-white">Total a pagar</p>
        <p class="font-display text-3xl text-white">{{ formatCOP(service.price) }}</p>
      </div>
    </div>

    <p class="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-2">
      <AppIcon name="whatsapp" :size="14" class="mt-0.5 shrink-0 text-brand" />
      Te enviaremos la confirmación a {{ whatsapp }}. El pago se realiza al finalizar el servicio.
    </p>

    <button
      type="button"
      class="mt-6 inline-flex w-full items-center justify-center gap-3 bg-brand px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-brand-hover active:scale-[0.99]"
      @click="emit('confirm')"
    >
      Confirmar cita
      <AppIcon name="check" :size="16" />
    </button>
    <button
      type="button"
      class="mt-3 inline-flex w-full items-center justify-center gap-2 border border-line-2 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted transition-colors hover:border-line hover:text-white"
      @click="emit('back')"
    >
      Volver
    </button>
  </div>
</template>