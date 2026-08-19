<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    data: { label: string; value: number }[]
    height?: number
    color?: string
    formatValue?: (v: number) => string
  }>(),
  { height: 160, color: '#e10600', formatValue: (v: number) => String(v) },
)

const max = computed(() => Math.max(1, ...props.data.map((d) => d.value)))
const width = computed(() => Math.max(120, props.data.length * 42))

function barHeight(value: number): number {
  return Math.max(2, (value / max.value) * props.height)
}
</script>

<template>
  <div class="w-full overflow-x-auto">
    <svg :width="width" :height="height + 34" role="img" aria-label="Gráfico de barras">
      <g>
        <rect
          v-for="(d, i) in data"
          :key="i"
          :x="i * 42"
          :y="height - barHeight(d.value)"
          :width="26"
          :height="barHeight(d.value)"
          :fill="color"
          rx="1"
        >
          <title>{{ d.label }}: {{ formatValue(d.value) }}</title>
        </rect>
      </g>
      <g fill="none" stroke="#232323" stroke-width="1">
        <line v-for="i in 4" :key="i" x1="0" :y1="(height / 4) * i" :x2="width" :y2="(height / 4) * i" />
      </g>
      <g text-anchor="middle" font-size="10" fill="#707070">
        <text v-for="(d, i) in data" :key="i" :x="i * 42 + 13" :y="height + 22">{{ d.label }}</text>
      </g>
    </svg>
  </div>
</template>