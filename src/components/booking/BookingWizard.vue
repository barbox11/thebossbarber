<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/booking'
import { useCatalogStore } from '@/stores/catalog'
import { publicApi } from '@/services/api'
import AppIcon from '@/components/ui/AppIcon.vue'
import StepService from '@/components/booking/StepService.vue'
import StepDate from '@/components/booking/StepDate.vue'
import StepTime from '@/components/booking/StepTime.vue'
import StepDetails from '@/components/booking/StepDetails.vue'
import StepConfirm from '@/components/booking/StepConfirm.vue'
import SuccessScreen from '@/components/booking/SuccessScreen.vue'
import type { Appointment, BookingStep, Service } from '@/types'

const store = useBookingStore()
const catalog = useCatalogStore()
const route = useRoute()
const router = useRouter()

const submitting = ref(false)
const submitError = ref<string | null>(null)
const created = ref<Appointment | null>(null)

const steps: { key: BookingStep; label: string }[] = [
  { key: 'service', label: 'Servicio' },
  { key: 'date', label: 'Fecha' },
  { key: 'time', label: 'Hora' },
  { key: 'details', label: 'Tus datos' },
  { key: 'confirm', label: 'Confirmar' },
]

const stepIndex = computed(() => steps.findIndex((s) => s.key === store.state.step))
const progress = computed(() => ((stepIndex.value + 1) / steps.length) * 100)

const services = computed(() => catalog.activeServices)

onMounted(async () => {
  await catalog.load()
  const queryService = route.query.servicio as string | undefined
  if (queryService) {
    const match = catalog.services.find((s) => s.id === queryService && s.active)
    if (match && !store.state.service) {
      store.selectService(match)
      store.setStep('date')
    }
  }
})

function canNext(): boolean {
  const s = store.state
  if (s.step === 'service') return Boolean(s.service)
  if (s.step === 'date') return Boolean(s.date)
  if (s.step === 'time') return Boolean(s.time)
  return false
}

function onSelectService(service: Service) {
  store.selectService(service)
  store.setStep('date')
}

function goNext() {
  const s = store.state
  if (s.step === 'service') store.setStep('date')
  else if (s.step === 'date') store.setStep('time')
  else if (s.step === 'time') store.setStep('details')
}

function goBack() {
  const s = store.state
  if (s.step === 'date') store.setStep('service')
  else if (s.step === 'time') store.setStep('date')
  else if (s.step === 'details') store.setStep('time')
  else if (s.step === 'confirm') store.setStep('details')
}

function onDetails(details: { name: string; phone: string; notes: string }) {
  store.setDetails(details)
  store.setStep('confirm')
}

async function onConfirm() {
  const s = store.state
  if (!s.service || !s.date || !s.time) return
  submitting.value = true
  submitError.value = null
  try {
    const result = await publicApi.createBooking({
      serviceId: s.service.id,
      date: s.date,
      time: s.time,
      name: s.name,
      phone: s.phone,
      whatsapp: s.phone,
      email: null,
      notes: s.notes || null,
    })
    if (result.ok && result.appointment) {
      created.value = result.appointment
      store.setResult(result)
      store.setStep('confirm')
    } else {
      submitError.value = result.error ?? 'No pudimos confirmar la cita.'
    }
  } catch (e) {
    submitError.value = e instanceof Error ? e.message : 'Ocurrió un error al reservar.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-3xl">
    <Transition name="slide" mode="out-in">
      <SuccessScreen v-if="created" key="success" />

      <div v-else key="wizard">
        <div class="mb-8">
          <button
            type="button"
            class="mb-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted transition-colors hover:text-white"
            @click="router.push('/')"
          >
            <AppIcon name="arrowLeft" :size="14" />
            Volver al inicio
          </button>

          <p class="eyebrow">Reserva tu cita</p>
          <h1 class="mt-3 text-display text-4xl text-white sm:text-5xl">
            Elige tu turno<span class="text-brand-hover">.</span>
          </h1>

          <div class="mt-7">
            <div class="flex items-center justify-between gap-2">
              <span
                v-for="(step, i) in steps"
                :key="step.key"
                class="flex flex-col items-start gap-1.5"
                :class="i <= stepIndex ? 'text-brand-hover' : 'text-muted-2'"
              >
                <span class="flex h-7 w-7 items-center justify-center border" :class="i <= stepIndex ? 'border-brand' : 'border-line-2'">
                  <AppIcon v-if="i < stepIndex" name="check" :size="12" class="text-brand-hover" />
                  <span v-else class="text-[10px] font-bold">{{ i + 1 }}</span>
                </span>
                <span class="hidden text-[9px] font-bold uppercase tracking-[0.18em] sm:block">{{ step.label }}</span>
              </span>
            </div>
            <div class="mt-3 h-1 bg-card">
              <div class="h-full bg-brand transition-all duration-500" :style="{ width: `${progress}%` }" />
            </div>
          </div>
        </div>

        <Transition name="slide" mode="out-in">
          <div :key="store.state.step">
            <div v-if="store.state.step === 'service'" class="reveal">
              <StepService :services="services" :selected-id="store.state.service?.id ?? null" @select="onSelectService" />
              <div class="mt-8 flex justify-end">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 bg-brand px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-hover disabled:opacity-40"
                  :disabled="!canNext()"
                  @click="goNext"
                >
                  Continuar
                  <AppIcon name="arrowRight" :size="14" />
                </button>
              </div>
            </div>

            <div v-else-if="store.state.step === 'date'" class="reveal">
              <StepDate />
              <div class="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted hover:text-white"
                  @click="goBack"
                >
                  <AppIcon name="arrowLeft" :size="14" />
                  Atrás
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 bg-brand px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-hover disabled:opacity-40"
                  :disabled="!canNext()"
                  @click="goNext"
                >
                  Continuar
                  <AppIcon name="arrowRight" :size="14" />
                </button>
              </div>
            </div>

            <div v-else-if="store.state.step === 'time'" class="reveal">
              <StepTime />
              <div class="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted hover:text-white"
                  @click="goBack"
                >
                  <AppIcon name="arrowLeft" :size="14" />
                  Atrás
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 bg-brand px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-hover disabled:opacity-40"
                  :disabled="!canNext()"
                  @click="goNext"
                >
                  Continuar
                  <AppIcon name="arrowRight" :size="14" />
                </button>
              </div>
            </div>

            <div v-else-if="store.state.step === 'details'" class="reveal">
              <StepDetails
                :initial="{ name: store.state.name, phone: store.state.phone, notes: store.state.notes }"
                @submit="onDetails"
              />
              <button
                type="button"
                class="mt-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted hover:text-white"
                @click="goBack"
              >
                <AppIcon name="arrowLeft" :size="14" />
                Atrás
              </button>
            </div>

            <div v-else class="reveal">
              <StepConfirm @back="goBack" @confirm="onConfirm" />
            </div>
          </div>
        </Transition>

        <div v-if="submitError" class="mt-5 border border-brand bg-brand-soft p-4">
          <p class="flex items-start gap-2 text-sm text-white">
            <AppIcon name="close" :size="16" class="mt-0.5 shrink-0 text-brand-hover" />
            {{ submitError }}
          </p>
        </div>
      </div>
    </Transition>

    <div v-if="submitting" class="mt-6 border border-line bg-card p-6 text-center">
      <p class="text-sm font-bold uppercase tracking-[0.2em] text-white">Confirmando tu cita…</p>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-enter-from {
  opacity: 0;
  transform: translateY(14px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>