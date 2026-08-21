<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { adminApi } from '@/services/api'
import type { BusinessSettings } from '@/types'
import { normalizePhoneNumber } from '@/utils/whatsapp'

const form = reactive<BusinessSettings>({
  businessName: '',
  barberName: '',
  phone: '',
  whatsapp: '',
  address: '',
  instagram: '',
  statsCustomers: '',
  statsYears: '',
  statsRating: '',
})

const loading = ref(true)
const saving = ref(false)
const saved = ref('')
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const settings = await adminApi.getSettings()
    Object.assign(form, { ...settings, phone: normalizePhoneNumber(settings.phone), whatsapp: normalizePhoneNumber(settings.whatsapp) })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No pudimos cargar la configuración.'
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  saved.value = ''
  error.value = null
  try {
    Object.assign(form, await adminApi.updateSettings({
      ...form,
      phone: normalizePhoneNumber(form.phone),
      whatsapp: normalizePhoneNumber(form.whatsapp),
    }))
    saved.value = 'Configuración guardada.'
    setTimeout(() => (saved.value = ''), 2500)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo guardar.'
  } finally {
    saving.value = false
  }
}

function field(label: string, key: keyof BusinessSettings, opts: { type?: string; placeholder?: string } = {}) {
  return { label, key, ...opts }
}

const fields: { label: string; key: keyof BusinessSettings; type?: string; placeholder?: string }[] = [
  field('Nombre del negocio', 'businessName', { placeholder: 'The Boss Barber' }),
  field('Nombre del barbero', 'barberName', { placeholder: 'El Maestro Barbero' }),
  field('Teléfono', 'phone', { type: 'tel', placeholder: '+57 300 000 0000' }),
  field('WhatsApp', 'whatsapp', { type: 'tel', placeholder: '+57 300 000 0000' }),
  field('Dirección', 'address', { placeholder: 'Calle, ciudad' }),
  field('Instagram (URL)', 'instagram', { type: 'url', placeholder: 'https://instagram.com/…' }),
  field('Estadística: clientes', 'statsCustomers', { placeholder: '+2.000' }),
  field('Estadística: años', 'statsYears', { placeholder: '5' }),
  field('Estadística: satisfacción', 'statsRating', { placeholder: '4.9/5' }),
]
</script>

<template>
  <div class="max-w-2xl">
    <h2 class="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-white">Configuración del negocio</h2>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 6" :key="i" class="h-14 animate-pulse bg-card" />
    </div>

    <form v-else class="grid gap-4 sm:grid-cols-2" novalidate @submit.prevent="save">
      <div v-for="f in fields" :key="f.key" :class="f.key === 'businessName' || f.key === 'address' ? 'sm:col-span-2' : ''">
        <label :for="`set-${f.key}`" class="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
          {{ f.label }}
        </label>
        <input
          :id="`set-${f.key}`"
          v-model="form[f.key]"
          :type="f.type ?? 'text'"
          :placeholder="f.placeholder"
          class="w-full border border-line bg-ink px-3 py-2.5 text-sm text-white placeholder:text-muted-2 focus:border-brand"
        />
      </div>

      <div class="sm:col-span-2">
        <p class="mb-4 text-xs leading-relaxed text-muted-2">
          Las estadísticas del hero (clientes, años, satisfacción) son textos editables. Si tu negocio aún no
          tiene esas cifras reales, son valores de muestra claramente identificables para reemplazar luego.
        </p>
        <button
          type="submit"
          class="inline-flex items-center justify-center gap-2 bg-brand px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
          :disabled="saving"
        >
          <span v-if="saving" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
          Guardar configuración
        </button>
        <span v-if="saved" class="ml-3 text-sm text-brand-hover">{{ saved }}</span>
      </div>

      <p v-if="error" class="border border-brand bg-brand-soft p-4 text-sm text-white sm:col-span-2">{{ error }}</p>
    </form>
  </div>
</template>