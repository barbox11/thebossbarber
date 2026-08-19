<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { sanitizeText, validateBookingDetails } from '@/utils/validation'
import type { BookingDetailsForm } from '@/utils/validation'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps<{
  initial: { name: string; phone: string; notes: string }
}>()

const emit = defineEmits<{ (e: 'submit', details: BookingDetailsForm): void }>()

const form = reactive<BookingDetailsForm>({ ...props.initial })
const errors = ref<Record<string, string>>({})

const nameValid = computed(() => sanitizeText(form.name).length >= 3)
const phoneValid = computed(() => sanitizeText(form.phone).length >= 7)

function validate(): boolean {
  const result = validateBookingDetails(form)
  const map: Record<string, string> = {}
  for (const e of result) map[e.field] = e.message
  errors.value = map
  return result.length === 0
}

function submit() {
  if (!validate()) return
  emit('submit', {
    name: sanitizeText(form.name),
    phone: sanitizeText(form.phone),
    notes: sanitizeText(form.notes),
  })
}

function inputClass(field: keyof BookingDetailsForm) {
  return [
    'w-full border bg-ink px-4 py-3.5 text-sm text-white placeholder:text-muted-2 transition-colors',
    errors.value[field] ? 'border-brand' : 'border-line focus:border-brand',
  ]
}
</script>

<template>
  <form class="grid gap-5" novalidate @submit.prevent="submit">
    <div>
      <label for="bk-name" class="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
        Nombre completo
      </label>
      <input
        id="bk-name"
        v-model="form.name"
        type="text"
        autocomplete="name"
        placeholder="Cómo te llamas"
        :class="inputClass('name')"
        @input="errors.name = ''"
      />
      <p v-if="errors.name" class="mt-2 text-xs text-brand-hover" role="alert">{{ errors.name }}</p>
    </div>

    <div>
      <label for="bk-phone" class="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
        Teléfono
      </label>
      <input
        id="bk-phone"
        v-model="form.phone"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
        placeholder="300 123 4567"
        :class="inputClass('phone')"
        @input="errors.phone = ''"
      />
      <p v-if="errors.phone" class="mt-2 text-xs text-brand-hover" role="alert">{{ errors.phone }}</p>
    </div>

    <div>
      <label for="bk-notes" class="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
        Notas <span class="text-muted-2">(opcional)</span>
      </label>
      <textarea
        id="bk-notes"
        v-model="form.notes"
        rows="3"
        placeholder="Cuéntanos qué estilo buscas…"
        class="w-full resize-none border border-line bg-ink px-4 py-3.5 text-sm text-white placeholder:text-muted-2 transition-colors focus:border-brand"
      />
    </div>

    <button
      type="submit"
      class="mt-2 inline-flex w-full items-center justify-center gap-3 bg-brand px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-brand-hover active:scale-[0.99]"
      :aria-disabled="!nameValid || !phoneValid"
    >
      Continuar
      <AppIcon name="arrowRight" :size="16" />
    </button>
  </form>
</template>