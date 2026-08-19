<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    percent: number
    size?: number
    label?: string
  }>(),
  { size: 120 },
)

const radius = computed(() => (props.size - 10) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = computed(() => circumference.value * (1 - Math.min(100, Math.max(0, props.percent)) / 100))
</script>

<template>
  <div class="relative inline-flex items-center justify-center" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :width="size" :height="size" role="img" aria-label="Progreso">
      <circle :cx="size / 2" :cy="size / 2" :r="radius" fill="none" stroke="#1a1a1a" stroke-width="8" />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        stroke="#e10600"
        stroke-width="8"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        transform="rotate(-90 60 60)"
        style="transition: stroke-dashoffset 0.6s ease"
      />
    </svg>
    <span class="absolute font-display text-2xl text-white">{{ percent }}%</span>
  </div>
</template>