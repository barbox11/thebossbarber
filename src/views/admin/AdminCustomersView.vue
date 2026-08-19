<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { adminApi } from '@/services/api'
import { formatCOP, WEEKDAYS_FULL } from '@/utils/format'
import type { CustomerWithStats } from '@/types'

const rows = ref<CustomerWithStats[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const query = ref('')

const visible = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
      (c.email ?? '').toLowerCase().includes(q),
  )
})

onMounted(async () => {
  try {
    rows.value = await adminApi.listCustomers()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No pudimos cargar los clientes.'
  } finally {
    loading.value = false
  }
})

function lastLabel(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${WEEKDAYS_FULL[d.getDay()]} ${d.getDate()}`
}
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-sm font-bold uppercase tracking-[0.2em] text-white">Clientes</h2>
      <input
        v-model="query"
        type="search"
        placeholder="Buscar por nombre, teléfono o correo…"
        class="w-full border border-line bg-ink px-4 py-2.5 text-sm text-white placeholder:text-muted-2 focus:border-brand sm:w-72"
        aria-label="Buscar clientes"
      />
    </div>

    <div v-if="loading" class="space-y-2">
      <div v-for="i in 5" :key="i" class="h-16 animate-pulse bg-card" />
    </div>

    <div v-else-if="error" class="border border-brand bg-brand-soft p-5 text-sm text-white">{{ error }}</div>

    <div v-else class="overflow-x-auto border border-line">
      <table class="w-full min-w-[720px] text-left text-sm">
        <thead class="border-b border-line bg-ink-2">
          <tr class="text-[10px] uppercase tracking-[0.16em] text-muted">
            <th class="px-4 py-3 font-bold">Cliente</th>
            <th class="px-4 py-3 font-bold">Contacto</th>
            <th class="px-4 py-3 font-bold">Reservas</th>
            <th class="px-4 py-3 font-bold">Última cita</th>
            <th class="px-4 py-3 font-bold">Total generado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr v-for="c in visible" :key="c.id" class="bg-card transition-colors hover:bg-card-2">
            <td class="px-4 py-3">
              <p class="font-semibold text-white">{{ c.name }}</p>
              <p class="text-xs text-muted">{{ c.email ?? 'Sin correo' }}</p>
            </td>
            <td class="px-4 py-3">
              <p class="text-muted">{{ c.phone }}</p>
              <p v-if="c.whatsapp && c.whatsapp !== c.phone" class="text-xs text-muted-2">WhatsApp: {{ c.whatsapp }}</p>
            </td>
            <td class="px-4 py-3"><span class="font-display text-lg text-white">{{ c.bookingsCount }}</span></td>
            <td class="px-4 py-3 text-muted">{{ lastLabel(c.lastBookingAt) }}</td>
            <td class="px-4 py-3 font-display text-lg text-white">{{ formatCOP(c.totalSpent) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="visible.length === 0" class="p-8 text-center text-sm text-muted-2">No se encontraron clientes.</p>
    </div>
  </div>
</template>