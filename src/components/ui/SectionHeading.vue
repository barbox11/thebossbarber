<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    description?: string
    align?: 'left' | 'center'
  }>(),
  { align: 'left' },
)
</script>

<template>
  <div
    class="reveal"
    :class="align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'"
  >
    <p v-if="eyebrow" class="eyebrow" :class="align === 'center' ? 'justify-center' : ''">{{ eyebrow }}</p>
    <h2
      v-if="title"
      class="mt-4 text-display text-4xl text-pure sm:text-5xl lg:text-6xl"
    >
      {{ title }}
    </h2>
    <p v-if="description" class="mt-5 text-[15px] leading-relaxed text-muted">
      {{ description }}
    </p>
  </div>
</template>