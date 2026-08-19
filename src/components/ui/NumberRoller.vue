<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{ value: string; startDelay?: number }>(),
  { startDelay: 0 },
)

const active = ref(false)

const chars = computed(() => props.value.split(''))

onMounted(() => {
  window.setTimeout(() => {
    active.value = true
  }, props.startDelay)
})

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9'
}
</script>

<template>
  <span class="inline-flex items-baseline" :aria-label="value">
    <template v-for="(ch, i) in chars" :key="`${ch}-${i}`">
      <span
        v-if="isDigit(ch)"
        class="digit-roll inline-block h-[1em] overflow-hidden align-baseline"
        :aria-hidden="true"
      >
        <span
          class="digit-strip flex flex-col will-change-transform"
          :class="active ? 'is-active' : ''"
          :style="{
            transitionDelay: `${startDelay + i * 70}ms`,
            transform: active ? `translateY(-${Number(ch)}em)` : 'translateY(-6em)',
          }"
        >
          <span v-for="d in 10" :key="d" class="flex h-[1em] items-baseline leading-none">{{ d - 1 }}</span>
        </span>
      </span>
      <span v-else class="align-baseline leading-none">{{ ch }}</span>
    </template>
  </span>
</template>

<style scoped>
.digit-strip {
  transition: transform 0.95s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>