<script setup lang="ts">
withDefaults(
  defineProps<{
    enabled: boolean
    busy?: boolean
    label: string
  }>(),
  { busy: false },
)

const emit = defineEmits<{ (event: 'toggle'): void }>()
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="enabled"
    :aria-label="label"
    :aria-busy="busy"
    :disabled="busy"
    class="group relative inline-flex h-11 w-26 shrink-0 items-center justify-between rounded-full border p-1 text-[9px] font-extrabold uppercase tracking-[0.12em] transition-colors disabled:cursor-wait disabled:opacity-80"
    :class="enabled ? 'border-brand/60 bg-brand/15 text-brand-hover' : 'border-line-2 bg-card-2 text-muted-2'"
    @click="emit('toggle')"
  >
    <span class="relative z-10 pl-2">{{ enabled ? 'Activo' : 'Pausado' }}</span>
    <span
      v-if="busy"
      class="absolute right-2.5 h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
      aria-hidden="true"
    />
    <span
      v-else
      class="absolute left-1 top-1 h-8 w-8 rounded-full bg-white shadow-sm transition-transform duration-200"
      :class="enabled ? 'translate-x-18' : 'translate-x-0'"
      aria-hidden="true"
    />
    <span v-if="!busy" class="relative z-10 ml-auto pr-2 text-[8px]" aria-hidden="true">
      {{ enabled ? 'ON' : 'OFF' }}
    </span>
  </button>
</template>
