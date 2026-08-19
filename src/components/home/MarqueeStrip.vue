<script setup lang="ts">
const words = ['Precisión', 'Estilo', 'Exclusividad', 'Detalle', 'Craft', 'Experiencia']
const sequence = [...words, ...words]
</script>

<template>
  <div class="relative overflow-hidden border-y border-line bg-ink-2 py-5" aria-hidden="true">
    <div class="flex w-max animate-marquee items-center gap-8 whitespace-nowrap will-change-transform">
      <template v-for="(word, i) in sequence" :key="`${word}-${i}`">
        <span class="font-display text-2xl uppercase tracking-wide text-white/85">{{ word }}</span>
        <span class="h-2.5 w-2.5 rotate-45 bg-brand" />
      </template>
    </div>
  </div>
</template>