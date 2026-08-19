<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
</script>

<template>
  <div class="flex min-h-dvh flex-col items-center justify-center bg-ink px-6 text-center">
    <p class="font-display text-8xl text-white">404</p>
    <span class="mt-4 h-1 w-16 bg-brand" aria-hidden="true" />
    <p class="mt-6 max-w-sm text-sm leading-relaxed text-muted">
      La página que buscas no existe o fue movida. Pero tu próximo corte sigue aquí.
    </p>
    <RouterLink
      to="/"
      class="mt-8 inline-flex items-center gap-2 bg-brand px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-hover"
    >
      <AppIcon name="arrowLeft" :size="16" />
      Volver al inicio
    </RouterLink>
  </div>
</template>