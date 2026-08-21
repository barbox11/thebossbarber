<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { formatCOP, minutesToLabel } from '@/utils/format'
import type { Service } from '@/types'

defineProps<{
  services: Service[]
  selectedId: string | null
}>()

const emit = defineEmits<{ (e: 'select', service: Service): void }>()
</script>

<template>
  <div>
    <ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      <li v-for="service in services" :key="service.id">
        <button
          type="button"
          class="group relative flex h-full w-full flex-col gap-4 border p-4 text-left transition-all duration-200 active:scale-[0.99]"
          :class="
            selectedId === service.id
              ? 'border-brand bg-card-2'
              : 'border-line bg-card hover:border-line-2 hover:bg-card-2'
          "
          :aria-pressed="selectedId === service.id"
          :aria-label="`Seleccionar ${service.name}`"
          @click="emit('select', service)"
        >
          <span
            class="absolute right-4 top-4 flex h-6 w-6 items-center justify-center border transition-colors"
            :class="selectedId === service.id ? 'border-brand bg-brand' : 'border-line-2'"
            aria-hidden="true"
          >
            <AppIcon v-if="selectedId === service.id" name="check" :size="14" class="text-white" />
          </span>

          <h3 class="font-display text-2xl uppercase tracking-wide text-pure">{{ service.name }}</h3>
          <p class="min-h-[2.5rem] text-sm leading-relaxed text-muted">{{ service.description }}</p>

          <div class="mt-auto flex items-end justify-between border-t border-line pt-4">
            <span class="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              <AppIcon name="clock" :size="13" class="text-brand" />
              {{ minutesToLabel(service.durationMin) }}
            </span>
            <span class="font-display text-2xl text-white">{{ formatCOP(service.price) }}</span>
          </div>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
</style>