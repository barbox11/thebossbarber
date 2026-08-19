<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    data: { label: string; value: number }[]
    formatValue?: (v: number) => string
  }>(),
  { formatValue: (v: number) => String(v) },
)

const max = computed(() => Math.max(1, ...props.data.map((d) => d.value)))

function pct(value: number): number {
  return Math.round((value / max.value) * 100)
}
</script>

<template>
  <ul class="space-y-3" role="list">
    <li v-for="d in data" :key="d.label">
      <div class="mb-1 flex items-center justify-between text-xs">
        <span class="font-semibold text-white">{{ d.label }}</span>
        <span class="text-muted">{{ formatValue(d.value) }}</span>
      </div>
      <div class="h-2 w-full bg-card">
        <div class="h-full bg-brand transition-all duration-500" :style="{ width: `${pct(d.value)}%` }" />
      </div>
    </li>
  </ul>
</template>