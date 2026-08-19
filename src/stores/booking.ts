import { defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'
import type { BookingStep, CreateBookingResult, Service } from '@/types'

export interface BookingState {
  step: BookingStep
  service: Service | null
  date: string | null
  time: string | null
  name: string
  phone: string
  notes: string
  submitting: boolean
  result: CreateBookingResult | null
}

export const useBookingStore = defineStore('booking', () => {
  const state = shallowRef<BookingState>({
    step: 'service',
    service: null,
    date: null,
    time: null,
    name: '',
    phone: '',
    notes: '',
    submitting: false,
    result: null,
  })

  const stepIndex = computed(
    () => (['service', 'date', 'time', 'details', 'confirm'] as BookingStep[]).indexOf(state.value.step),
  )

  function setStep(step: BookingStep) {
    state.value = { ...state.value, step }
  }
  function selectService(service: Service) {
    state.value = { ...state.value, service, date: null, time: null }
  }
  function selectDate(date: string) {
    state.value = { ...state.value, date, time: null }
  }
  function selectTime(time: string) {
    state.value = { ...state.value, time }
  }
  function setDetails(details: { name: string; phone: string; notes: string }) {
    state.value = { ...state.value, ...details }
  }
  function setResult(result: CreateBookingResult | null) {
    state.value = { ...state.value, result }
  }
  function reset() {
    state.value = {
      step: 'service',
      service: null,
      date: null,
      time: null,
      name: '',
      phone: '',
      notes: '',
      submitting: false,
      result: null,
    }
  }

  return { state, stepIndex, setStep, selectService, selectDate, selectTime, setDetails, setResult, reset }
})
