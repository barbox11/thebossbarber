<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/booking'
import AppIcon from '@/components/ui/AppIcon.vue'
import { downloadIcs } from '@/utils/ics'
import { formatCOP, formatDateFull, formatTime12, minutesToLabel } from '@/utils/format'
import { toWhatsAppNumber } from '@/utils/whatsapp'

const store = useBookingStore()
const router = useRouter()

const service = computed(() => store.state.service)
const date = computed(() => store.state.date ?? '')
const time = computed(() => store.state.time ?? '')

function whatsappLink(): string | null {
  const s = service.value
  const wa = store.state.phone
  if (!s || !wa) return null
  const msg = [
    'Hola The Boss Barber,',
    'quiero confirmar mi cita:',
    '',
    `• Servicio: ${s.name}`,
    `• Fecha: ${formatDateFull(date.value)}`,
    `• Hora: ${formatTime12(time.value)}`,
    `• Nombre: ${store.state.name}`,
  ].join('\n')
  return `https://wa.me/${toWhatsAppNumber(wa)}?text=${encodeURIComponent(msg)}`
}

function addToCalendar() {
  const s = service.value
  if (!s) return
  const end = new Date(`${date.value}T${time.value}:00`)
  end.setMinutes(end.getMinutes() + s.durationMin)
  downloadIcs({
    title: `${s.name} — The Boss Barber`,
    location: 'The Boss Barber',
    description: `Cita confirmada con ${store.state.name}.`,
    date: date.value,
    startTime: time.value,
    endTime: `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`,
    tz: 'America/Bogota',
  })
}
</script>

<template>
  <div>
    <div class="text-center">
      <span
        class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand text-white"
        aria-hidden="true"
      >
        <AppIcon name="check" :size="40" />
      </span>
      <h2 class="mt-6 text-display text-4xl text-white sm:text-5xl">
        Cita confirmada<span class="text-brand-hover">.</span>
      </h2>
      <p class="mt-3 text-sm text-muted">Te esperamos. Llega puntual y disfruta la experiencia.</p>
    </div>

    <div class="mt-8 border border-line bg-card">
      <div class="grid grid-cols-2 divide-x divide-line border-b border-line">
        <div class="p-5">
          <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">Servicio</p>
          <p class="mt-1.5 font-display text-xl uppercase text-white">{{ service?.name }}</p>
        </div>
        <div class="p-5">
          <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">Valor</p>
          <p class="mt-1.5 font-display text-xl text-white">{{ service ? formatCOP(service.price) : '' }}</p>
        </div>
      </div>
      <div class="grid grid-cols-2 divide-x divide-line border-b border-line">
        <div class="p-5">
          <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">Fecha</p>
          <p class="mt-1.5 text-sm font-semibold text-white">{{ formatDateFull(date) }}</p>
        </div>
        <div class="p-5">
          <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">Hora</p>
          <p class="mt-1.5 text-sm font-semibold text-white">
            {{ formatTime12(time) }}
            <span class="ml-1 text-muted-2">· {{ service ? minutesToLabel(service.durationMin) : '' }}</span>
          </p>
        </div>
      </div>
    </div>

    <div class="mt-6 grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-3 border border-line-2 px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-brand hover:text-brand-hover"
        @click="addToCalendar"
      >
        <AppIcon name="calendarPlus" :size="18" />
        Agregar al calendario
      </button>
      <a
        :href="whatsappLink() ?? '#'"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center justify-center gap-3 bg-brand px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-hover"
      >
        <AppIcon name="whatsapp" :size="18" />
        Confirmar por WhatsApp
      </a>
    </div>

    <button
      type="button"
      class="mt-3 w-full border border-line-2 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted transition-colors hover:text-white"
      @click="router.push('/')"
    >
      Volver al inicio
    </button>
  </div>
</template>