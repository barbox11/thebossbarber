<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { adminApi } from '@/services/api'
import AppIcon from '@/components/ui/AppIcon.vue'
import { formatCOP, minutesToLabel } from '@/utils/format'
import type { Service } from '@/types'

const services = ref<Service[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const editing = ref<Service | null>(null)
const showForm = ref(false)
const toggling = ref<Set<string>>(new Set())

const form = reactive({
  name: '',
  description: '',
  price: 0,
  durationMin: 45,
  active: true,
  sortOrder: 0,
})

async function load() {
  loading.value = true
  error.value = null
  try {
    services.value = (await adminApi.listServices()).sort((a, b) => a.sortOrder - b.sortOrder)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No pudimos cargar los servicios.'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  Object.assign(form, { name: '', description: '', price: 0, durationMin: 45, active: true, sortOrder: services.value.length + 1 })
  showForm.value = true
}

function openEdit(s: Service) {
  editing.value = s
  Object.assign(form, {
    name: s.name,
    description: s.description ?? '',
    price: s.price,
    durationMin: s.durationMin,
    active: s.active,
    sortOrder: s.sortOrder,
  })
  showForm.value = true
}

async function save() {
  if (!form.name.trim() || form.price < 0) return
  try {
    if (editing.value) {
      await adminApi.updateService(editing.value.id, { ...form, description: form.description || null })
    } else {
      await adminApi.createService({ ...form, description: form.description || null })
    }
    showForm.value = false
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo guardar.'
  }
}

async function toggleActive(s: Service) {
  if (toggling.value.has(s.id)) return
  toggling.value = new Set(toggling.value).add(s.id)
  error.value = null
  try {
    const updated = await adminApi.updateService(s.id, { active: !s.active })
    const idx = services.value.findIndex((x) => x.id === s.id)
    if (idx !== -1) services.value[idx] = { ...services.value[idx], ...updated }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo cambiar el estado del servicio.'
  } finally {
    const next = new Set(toggling.value)
    next.delete(s.id)
    toggling.value = next
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-sm font-bold uppercase tracking-[0.2em] text-white">Servicios</h2>
      <button
        type="button"
        class="inline-flex items-center gap-2 bg-brand px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-brand-hover"
        @click="openCreate"
      >
        <AppIcon name="plus" :size="15" />
        Nuevo servicio
      </button>
    </div>

    <div v-if="loading" class="space-y-2">
      <div v-for="i in 4" :key="i" class="h-16 animate-pulse bg-card" />
    </div>

    <div v-else-if="error" class="border border-brand bg-brand-soft p-5 text-sm text-white">{{ error }}</div>

    <div v-else>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article v-for="s in services" :key="s.id" class="border border-line bg-card">
        <div class="flex items-start justify-between gap-3 p-4">
          <div class="min-w-0">
            <p class="truncate font-semibold text-white" :class="s.active ? '' : 'opacity-50'">{{ s.name }}</p>
            <p class="mt-1 line-clamp-2 text-xs text-muted">{{ s.description }}</p>
          </div>
          <button
            type="button"
            role="switch"
            :aria-checked="s.active"
            :aria-label="`${s.active ? 'Desactivar' : 'Activar'} ${s.name}`"
            :aria-busy="toggling.has(s.id)"
            :disabled="toggling.has(s.id)"
            class="relative h-11 w-14 shrink-0 rounded-full transition-colors disabled:cursor-wait"
            :class="s.active ? 'bg-brand' : 'bg-card-2'"
            @click="toggleActive(s)"
          >
            <span
              v-if="toggling.has(s.id)"
              class="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-white/50 border-t-white"
              aria-hidden="true"
            />
            <span
              v-else
              class="absolute top-3 h-5 w-5 rounded-full bg-white transition-transform"
              :class="s.active ? 'translate-x-8' : 'translate-x-1'"
            />
          </button>
        </div>
        <div class="flex items-center justify-between gap-3 border-t border-line p-4">
          <div class="flex items-baseline gap-2">
            <span class="font-display text-lg text-white">{{ formatCOP(s.price) }}</span>
            <span class="text-xs text-muted">{{ minutesToLabel(s.durationMin) }}</span>
          </div>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center border border-line-2 text-muted transition-colors hover:border-brand hover:text-brand-hover"
            :aria-label="`Editar ${s.name}`"
            @click="openEdit(s)"
          >
            <AppIcon name="edit" :size="14" />
          </button>
        </div>
      </article>
    </div>

    <div class="hidden overflow-x-auto border border-line md:block">
      <table class="w-full min-w-160 text-left text-sm">
        <thead class="border-b border-line bg-ink-2">
          <tr class="text-[10px] uppercase tracking-[0.16em] text-muted">
            <th class="px-4 py-3 font-bold">Servicio</th>
            <th class="px-4 py-3 font-bold">Duración</th>
            <th class="px-4 py-3 font-bold">Precio</th>
            <th class="px-4 py-3 font-bold">Estado</th>
            <th class="px-4 py-3 font-bold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr v-for="s in services" :key="s.id" class="bg-card transition-colors hover:bg-card-2">
            <td class="px-4 py-3">
              <p class="font-semibold text-white" :class="s.active ? '' : 'opacity-50'">{{ s.name }}</p>
              <p class="text-xs text-muted">{{ s.description }}</p>
            </td>
            <td class="px-4 py-3 text-muted">{{ minutesToLabel(s.durationMin) }}</td>
            <td class="px-4 py-3 font-display text-lg text-white">{{ formatCOP(s.price) }}</td>
            <td class="px-4 py-3">
              <button
                type="button"
                role="switch"
                :aria-checked="s.active"
                :aria-label="`${s.active ? 'Desactivar' : 'Activar'} ${s.name}`"
                :aria-busy="toggling.has(s.id)"
                :disabled="toggling.has(s.id)"
                class="relative h-11 w-14 rounded-full transition-colors disabled:cursor-wait"
                :class="s.active ? 'bg-brand' : 'bg-card-2'"
                @click="toggleActive(s)"
              >
                <span
                  v-if="toggling.has(s.id)"
                  class="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-white/50 border-t-white"
                  aria-hidden="true"
                />
                <span
                  v-else
                  class="absolute top-3 h-5 w-5 rounded-full bg-white transition-transform"
                  :class="s.active ? 'translate-x-8' : 'translate-x-1'"
                />
              </button>
            </td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-1.5">
                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center border border-line-2 text-muted transition-colors hover:border-brand hover:text-brand-hover"
                  :aria-label="`Editar ${s.name}`"
                  @click="openEdit(s)"
                >
                  <AppIcon name="edit" :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showForm" class="fixed inset-0 z-90 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Formulario de servicio" @click.self="showForm = false">
          <form class="w-full max-w-md border border-line bg-ink-2 p-6" novalidate @submit.prevent="save">
            <div class="mb-5 flex items-center justify-between">
              <h3 class="font-display text-2xl uppercase text-white">{{ editing ? 'Editar servicio' : 'Nuevo servicio' }}</h3>
              <button type="button" class="text-muted hover:text-white" aria-label="Cerrar" @click="showForm = false">
                <AppIcon name="close" :size="20" />
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label for="sv-name" class="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Nombre</label>
                <input id="sv-name" v-model="form.name" type="text" class="w-full border border-line bg-ink px-3 py-2.5 text-sm text-white" />
              </div>
              <div>
                <label for="sv-desc" class="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Descripción</label>
                <textarea id="sv-desc" v-model="form.description" rows="2" class="w-full resize-none border border-line bg-ink px-3 py-2.5 text-sm text-white" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="sv-price" class="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Precio</label>
                  <input id="sv-price" v-model.number="form.price" type="number" min="0" step="1000" class="w-full border border-line bg-ink px-3 py-2.5 text-sm text-white" />
                </div>
                <div>
                  <label for="sv-duration" class="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Duración (min)</label>
                  <input id="sv-duration" v-model.number="form.durationMin" type="number" min="15" step="15" class="w-full border border-line bg-ink px-3 py-2.5 text-sm text-white" />
                </div>
              </div>
              <label class="flex items-center gap-3 text-sm text-white">
                <input v-model="form.active" type="checkbox" class="h-4 w-4 accent-brand" />
                Servicio activo
              </label>
            </div>

            <button type="submit" class="mt-6 inline-flex w-full items-center justify-center gap-2 bg-brand px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand-hover">
              {{ editing ? 'Guardar cambios' : 'Crear servicio' }}
            </button>
          </form>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active form,
.modal-leave-active form {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from form,
.modal-leave-to form {
  transform: scale(0.97) translateY(8px);
}
</style>